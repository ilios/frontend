import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";
import moment from 'moment';

const { computed, RSVP, isEmpty, isPresent } = Ember;
const { gt, sort } = computed;
const { PromiseArray } = DS;

export default Ember.Controller.extend({
  i18n: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  queryParams: {
    schoolId: 'school',
    yearTitle: 'year',
    titleFilter: 'filter',
    userCoursesOnly: 'mycourses'
  },
  placeholderValue: t('courses.titleFilterPlaceholder'),
  schoolId: null,
  yearTitle: null,
  titleFilter: null,
  userCoursesOnly: false,
  showNewCourseForm: false,
  sortSchoolsBy:['title'],
  sortedSchools: sort('model.schools', 'sortSchoolsBy'),
  sortYearsBy:['title:desc'],
  sortedYears: sort('model.years', 'sortYearsBy'),
  newCourses: [],
  courses: computed('selectedSchool', 'selectedYear', function(){
    let defer = RSVP.defer();
    let schoolId = this.get('selectedSchool').get('id');
    let yearTitle = this.get('selectedYear').get('title');
    if(isEmpty(schoolId) || isEmpty(yearTitle)){
      defer.resolve([]);
    } else {
      this.get('store').query('course', {
        filters: {
          school: schoolId,
          year: yearTitle
        },
        limit: 500
      }).then(courses => {
        defer.resolve(courses);
      });
    }

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  coursesAndNewCourses: computed('courses.[]', 'newCourses.[]', function(){
    let defer = RSVP.defer();
    this.get('courses').then(courses => {
      let all = [];
      all.pushObjects(courses.toArray());
      let selectedYearTitle = this.get('selectedYear').get('title');
      let newCourses = this.get('newCourses').filter(course => {
        return course.get('year') === selectedYearTitle;
      });
      all.pushObjects(newCourses.toArray());
      defer.resolve(all);
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('titleFilter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('titleFilter'));
  },
  hasMoreThanOneSchool: gt('model.schools.length', 1),
  allRelatedCourses: computed('currentUser.model', function(){
    let defer = RSVP.defer();
    this.get('currentUser.model').then(user => {
      defer.resolve(user.get('allRelatedCourses'));
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  filteredCourses: computed(
    'debouncedFilter',
    'coursesAndNewCourses.[]',
    'userCoursesOnly',
    'allRelatedCourses.[]',
    function(){
      let defer = RSVP.defer();
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
              return allRelatedCourses.contains(course);
            });

            defer.resolve(myFilteredCourses);
          });
        } else {
          defer.resolve(filteredCourses);
        }

      });


      return PromiseArray.create({
        promise: defer.promise
      });
  }),
  selectedSchool: computed('model.schools.[]', 'schoolId', function(){
    let schools = this.get('model.schools');
    if(isPresent(this.get('schoolId'))){
      let school =  schools.find(school => {
        return school.get('id') === this.get('schoolId');
      });
      if(school){
        return school;
      }
    }
    return schools.get('firstObject');
  }),
  selectedYear: computed('model.years.[]', 'yearTitle', function(){
    let years = this.get('model.years');
    if(isPresent(this.get('yearTitle'))){
      return years.find(year => {
        return year.get('title') === parseInt(this.get('yearTitle'));
      });
    }
    let currentYear = moment().format('YYYY');
    const currentMonth = parseInt(moment().format('M'));
    if(currentMonth < 6){
      currentYear--;
    }
    let defaultYear = years.find(year => year.get('id') === currentYear);
    if(isEmpty(defaultYear)){
      defaultYear = years.get('lastObject');
    }
    
    return defaultYear;
  }),
  actions: {
    editCourse: function(course){
      this.transitionToRoute('course', course);
    },
    removeCourse: function(course){
      course.deleteRecord();
      course.save();
    },
    saveNewCourse: function(newCourse){
      newCourse.setDatesBasedOnYear();
      newCourse.save().then(savedCourse => {
        this.set('showNewCourseForm', false);
        this.get('newCourses').pushObject(savedCourse);
      });
    },
    removeNewCourse: function(newCourse){
      let courseProxy = this.get('newCourses').find(proxy => {
        return proxy.get('content') === newCourse;
      });
      this.get('newCourses').removeObject(courseProxy);
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
      var newStatus = (! this.get('userCoursesOnly'));
      //then set it to the new status
      this.set('userCoursesOnly', newStatus);
    },
    toggleNewCourseForm: function(){
      this.set('showNewCourseForm', !this.get('showNewCourseForm'));
    }
  },
});
