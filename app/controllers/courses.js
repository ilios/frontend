/* eslint ember/avoid-leaking-state-in-ember-objects: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import { isPresent, isEmpty, isBlank } from '@ember/utils';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import escapeRegExp from '../utils/escape-reg-exp';

const { gt, sort } = computed;

export default Controller.extend({
  i18n: service(),
  currentUser: service(),
  queryParams: {
    schoolId: 'school',
    yearTitle: 'year',
    titleFilter: 'filter',
    userCoursesOnly: 'mycourses',
    sortCoursesBy: 'sortBy',

  },
  schoolId: null,
  yearTitle: null,
  titleFilter: null,
  userCoursesOnly: false,
  sortCoursesBy: 'title',
  showNewCourseForm: false,
  sortSchoolsBy:['title'],
  sortedSchools: sort('model.schools', 'sortSchoolsBy'),
  sortYearsBy:['title:desc'],
  sortedYears: sort('model.years', 'sortYearsBy'),
  newCourse: null,
  deletedCourse: null,
  courses: computed('selectedSchool', 'selectedYear', 'deletedCourse', 'newCourse', async function(){
    const selectedSchool = this.get('selectedSchool');
    const selectedYear = this.get('selectedYear');
    if (isEmpty(selectedSchool) || isEmpty(selectedYear)) {
      return [];
    }

    let schoolId = selectedSchool.get('id');
    let yearTitle = selectedYear.get('title');
    return await this.get('store').query('course', {
      filters: {
        school: schoolId,
        year: yearTitle,
        archived: false
      }
    });
  }),

  changeTitleFilter: task(function * (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable(),

  hasMoreThanOneSchool: gt('model.schools.length', 1),

  allRelatedCourses: computed('currentUser.model.allRelatedCourses.[]', async function(){
    const currentUser = this.get('currentUser');
    const user = await currentUser.get('model');
    return await user.get('allRelatedCourses');
  }),

  filteredCourses: computed(
    'titleFilter',
    'courses.[]',
    'userCoursesOnly',
    'allRelatedCourses.[]',
    async function(){
      const titleFilter = this.get('titleFilter');
      const title = isBlank(titleFilter) ? '' : titleFilter ;
      const cleanTitle = escapeRegExp(title);
      let filterMyCourses = this.get('userCoursesOnly');
      let exp = new RegExp(cleanTitle, 'gi');
      const courses = await this.get('courses');
      let filteredCourses;
      if (isEmpty(cleanTitle)) {
        filteredCourses = courses.sortBy('title');
      } else {
        filteredCourses = courses.filter(course => {
          return (isPresent(course.get('title')) && course.get('title').match(exp)) ||
            (isPresent(course.get('externalId')) && course.get('externalId').match(exp));
        }).sortBy('title');
      }
      if (filterMyCourses) {
        const allRelatedCourses = await this.get('allRelatedCourses');
        filteredCourses = filteredCourses.filter(course => allRelatedCourses.includes(course));
      }
      return filteredCourses;
    }
  ),
  selectedSchool: computed('model.schools.[]', 'schoolId', 'primarySchool', function(){
    const schools = this.get('model.schools');
    const primarySchool = this.get('model.primarySchool');
    const schoolId = this.get('schoolId');
    if(isPresent(schoolId)){
      let school = schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }

    return primarySchool;
  }),
  selectedYear: computed('model.years.[]', 'yearTitle', function(){
    let years = this.get('model.years');
    if(isPresent(this.get('yearTitle'))){
      return years.find(year => year.get('title') === parseInt(this.get('yearTitle')));
    }
    let currentYear = parseInt(moment().format('YYYY'));
    const currentMonth = parseInt(moment().format('M'));
    if(currentMonth < 6){
      currentYear--;
    }
    let defaultYear = years.find(year => parseInt(year.get('id')) === currentYear);
    if(isEmpty(defaultYear)){
      defaultYear = years.get('lastObject');
    }

    return defaultYear;
  }),

  actions: {
    async removeCourse(course){
      const school = await this.get('selectedSchool');
      const courses = school.get('courses');
      courses.removeObject(course);
      await course.destroyRecord();
      this.set('deletedCourse', course);
      let newCourse = this.get('newCourse');
      if (newCourse === course) {
        this.set('newCourse', null);
      }
    },
    async saveNewCourse(newCourse){
      newCourse.setDatesBasedOnYear();
      const savedCourse = await newCourse.save();
      this.set('showNewCourseForm', false);
      this.set('newCourse', savedCourse);
      const school = await this.get('selectedSchool');
      const courses = await school.get('courses');
      courses.pushObject(savedCourse);
      return savedCourse;
    },
    changeSelectedYear(yearTitle) {
      this.set('yearTitle', yearTitle);
    },
    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
    //called by the 'toggle-mycourses' component
    toggleMyCourses() {
      //get the current userCoursesOnly status and flip it
      let newStatus = (! this.get('userCoursesOnly'));
      //then set it to the new status
      this.set('userCoursesOnly', newStatus);
    },
    toggleNewCourseForm() {
      this.set('showNewCourseForm', !this.get('showNewCourseForm'));
    },
    lockCourse(course) {
      course.set('locked', true);
      return course.save();
    },
    unlockCourse(course) {
      course.set('locked', false);
      return course.save();
    },
  },
});
