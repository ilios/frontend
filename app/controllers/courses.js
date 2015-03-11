import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  queryParams: {
    schoolId: 'school',
    yearTitle: 'year',
    titleFilter: 'filter',
    userCoursesOnly: 'mycourses'
  },
  placeholderValueTranslation: 'courses.titleFilterPlaceholder',
  schoolId: null,
  yearTitle: null,
  titleFilter: null,
  userCoursesOnly: false,
  years: [],
  schools: [],
  newCourses: [],

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('titleFilter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('titleFilter'));
  },
  hasMoreThanOneSchool: Ember.computed.gt('schools.length', 1),
  filteredCourses: function(){
    var title = this.get('debouncedFilter');
    var filterMyCourses = this.get('userCoursesOnly');
    var exp = new RegExp(title, 'gi');
    var currentUser = this.get('currentUser');
    return this.get('content').filter(function(course) {
      if(title == null || course.get('title').match(exp)){
        if(filterMyCourses){
          return currentUser.get('allRelatedCourses').contains(course);
        }
        return true;
      }

      return false;
    }).sortBy('title');
  }.property('debouncedFilter', 'content.@each', 'userCoursesOnly', 'currentUser.allRelatedCourses.@each'),
  actions: {
    editCourse: function(course){
      this.transitionToRoute('course', course);
    },
    removeCourse: function(course){
      this.get('content').removeObject(course);
      course.deleteRecord();
      course.save();
    },
    addCourse: function(){
      var course = this.store.createRecord('course', {
        title: null,
        owningSchool: this.get('selectedSchool'),
        year: this.get('selectedYear.title'),
        level: 1,
      });
      this.get('newCourses').addObject(course);
    },
    saveNewCourse: function(newCourse){
      var self = this;
      self.get('newCourses').removeObject(newCourse);
      newCourse.setDatesBasedOnYear();
      newCourse.save().then(function(savedCourse){
        self.transitionToRoute('course', savedCourse);
      });
    },
    removeNewCourse: function(newCourse){
      this.get('newCourses').removeObject(newCourse);
    },
    changeSelectedYear: function(year){
      this.set('yearTitle', year.get('title'));
      this.set('selectedYear', year);
    },
    changeSelectedSchool: function(school){
      this.set('schoolId', school.get('id'));
      this.set('selectedSchool', school);
    }
  },
});
