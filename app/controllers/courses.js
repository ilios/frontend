import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";
import moment from 'moment';
import escapeRegExp from '../utils/escape-reg-exp';

const { computed, Controller, RSVP, isEmpty, isPresent, observer, inject, run } = Ember;
const { debounce } = run;
const { Promise } = RSVP;
const { service } = inject;
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
  didReceiveAttrs() {
    this._super(...arguments);
    this.set('newCourse', null);
  },
  placeholderValue: t('general.courseTitleFilterPlaceholder'),
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
  deletedCourses: [],
  courses: computed('selectedSchool', 'selectedYear', 'deletedCourses.[]', 'newCourse', function(){
    return new Promise(resolve => {
      const selectedSchool = this.get('selectedSchool');
      const selectedYear = this.get('selectedYear');
      if (isEmpty(selectedSchool) || isEmpty(selectedYear)) {
        resolve([]);
      } else {
        let schoolId = selectedSchool.get('id');
        let yearTitle = selectedYear.get('title');
        this.get('store').query('course', {
          filters: {
            school: schoolId,
            year: yearTitle,
            archived: false
          },
          limit: 500
        }).then(courses => {
          resolve(courses.toArray());
        });
      }
    });
  }),

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: observer('titleFilter', function(){
    debounce(this, this.setFilter, 500);
  }),
  setFilter: function(){
    const titleFilter = this.get('titleFilter');
    const clean = escapeRegExp(titleFilter);
    this.set('debouncedFilter', clean);
  },
  hasMoreThanOneSchool: gt('model.schools.length', 1),

  allRelatedCourses: computed('currentUser.model.allRelatedCourses.[]', function(){
    return new Promise(resolve => {
      this.get('currentUser.model').then(user => {
        resolve(user.get('allRelatedCourses'));
      });
    });
  }),

  filteredCourses: computed(
    'debouncedFilter',
    'courses.[]',
    'userCoursesOnly',
    'allRelatedCourses.[]',
    function(){
      return new Promise(resolve => {
        let title = this.get('debouncedFilter');
        let filterMyCourses = this.get('userCoursesOnly');
        let exp = new RegExp(title, 'gi');
        this.get('courses').then(courses => {
          let filteredCourses;
          if (isEmpty(title)) {
            filteredCourses = courses.sortBy('title');
          } else {
            filteredCourses = courses.filter(course => {
              return (isPresent(course.get('title')) && course.get('title').match(exp)) ||
                (isPresent(course.get('externalId')) && course.get('externalId').match(exp));
            }).sortBy('title');
          }

          if (filterMyCourses) {
            this.get('allRelatedCourses').then(allRelatedCourses => {
              let myFilteredCourses = filteredCourses.filter(course => {
                return allRelatedCourses.includes(course);
              });

              resolve(myFilteredCourses);
            });
          } else {
            resolve(filteredCourses);
          }
        });
      });
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
    removeCourse(course){
      return new Promise(resolve => {
        let school = this.get('selectedSchool');
        school.get('courses').then(courses => {
          courses.removeObject(course);
          course.destroyRecord().then(() => {
            this.get('deletedCourses').pushObject(course);
            let newCourse = this.get('newCourse');
            if (newCourse === course) {
              this.set('newCourse', null);
            }
            resolve();
          });
        });
      });
    },
    saveNewCourse(newCourse){
      return new Promise(resolve => {
        newCourse.setDatesBasedOnYear();
        newCourse.save().then(savedCourse => {
          this.set('showNewCourseForm', false);
          this.set('newCourse', savedCourse);
          let school = this.get('selectedSchool');
          school.get('courses').then(courses => {
            courses.pushObject(savedCourse);
            resolve(savedCourse);
          });
        });
      });
    },
    changeSelectedYear: function(yearTitle){
      this.set('yearTitle', yearTitle);
    },
    changeSelectedSchool: function(schoolId){
      this.set('schoolId', schoolId);
    },
    //called by the 'toggle-mycourses' component
    toggleMyCourses: function(){
      //get the current userCoursesOnly status and flip it
      let newStatus = (! this.get('userCoursesOnly'));
      //then set it to the new status
      this.set('userCoursesOnly', newStatus);
    },
    toggleNewCourseForm: function(){
      this.set('showNewCourseForm', !this.get('showNewCourseForm'));
    },
    lockCourse: function(course){
      course.set('locked', true);
      return course.save();
    },
    unlockCourse: function(course){
      course.set('locked', false);
      return course.save();
    },
  },
});
