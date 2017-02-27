import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";
import moment from 'moment';
import escapeRegExp from '../utils/escape-reg-exp';

const { computed, Controller, RSVP, isEmpty, isPresent, observer, set, inject, run } = Ember;
const { debounce } = run;
const { defer, Promise } = RSVP;
const { service } = inject;
const { gt, sort } = computed;
const { PromiseArray } = DS;

export default Controller.extend({
  init() {
    this._super(...arguments);
    set(this, 'newCourses', []);
  },
  i18n: service(),
  currentUser: service(),
  queryParams: {
    schoolId: 'school',
    yearTitle: 'year',
    titleFilter: 'filter',
    userCoursesOnly: 'mycourses',
    sortCoursesBy: 'sortBy',

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
  newCourses: [],
  courses: computed('selectedSchool', 'selectedYear', function(){
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
          resolve(courses);
        });
      }
    });
  }),

  coursesAndNewCourses: computed('courses.[]', 'newCourses.[]', function(){
    let deferred = defer();
    this.get('courses').then(courses => {
      let all = [];
      all.pushObjects(courses.toArray());
      const selectedYear = this.get('selectedYear');
      if (isPresent(selectedYear)) {
        let selectedYearTitle = selectedYear.get('title');
        let newCourses = this.get('newCourses').filter(course => {
          return course.get('year') === selectedYearTitle && !all.includes(course);
        });
        all.pushObjects(newCourses.toArray());
      }

      deferred.resolve(all);
    });

    return PromiseArray.create({
      promise: deferred.promise
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
  allRelatedCourses: computed('currentUser.model', function(){
    let deferred = defer();
    this.get('currentUser.model').then(user => {
      deferred.resolve(user.get('allRelatedCourses'));
    });
    return PromiseArray.create({
      promise: deferred.promise
    });
  }),
  filteredCourses: computed(
    'debouncedFilter',
    'coursesAndNewCourses.[]',
    'userCoursesOnly',
    'allRelatedCourses.[]',
    function(){
      let deferred = defer();
      let title = this.get('debouncedFilter');
      let filterMyCourses = this.get('userCoursesOnly');
      let exp = new RegExp(title, 'gi');
      this.get('coursesAndNewCourses').then(courses => {
        let filteredCourses;
        if(isEmpty(title)){
          filteredCourses = courses.sortBy('title');
        } else {
          filteredCourses = courses.filter(course => {
            return (isPresent(course.get('title')) &&course.get('title').match(exp)) ||
                   (isPresent(course.get('externalId')) &&course.get('externalId').match(exp));
          }).sortBy('title');
        }

        if(filterMyCourses){
          this.get('allRelatedCourses').then(allRelatedCourses => {
            let myFilteredCourses = filteredCourses.filter(course => {
              return allRelatedCourses.includes(course);
            });

            deferred.resolve(myFilteredCourses);
          });
        } else {
          deferred.resolve(filteredCourses);
        }

      });


      return PromiseArray.create({
        promise: deferred.promise
      });
    }
  ),
  selectedSchool: computed('model.schools.[]', 'schoolId', 'primarySchool', function(){
    const schools = this.get('model.schools');
    const primarySchool = this.get('model.primarySchool');
    if(isPresent(this.get('schoolId'))){
      let school =  schools.find(school => {
        return school.get('id') === this.get('schoolId');
      });
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
    removeCourse: function(course){
      course.deleteRecord();
      course.save().then(()=>{
        if (this.get('newCourses').includes(course)) {
          this.get('newCourses').removeObject(course);
        }
      });
    },
    saveNewCourse: function(newCourse){
      newCourse.setDatesBasedOnYear();
      return newCourse.save().then(savedCourse => {
        this.set('showNewCourseForm', false);
        this.get('newCourses').pushObject(savedCourse);
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
