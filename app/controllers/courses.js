import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  queryParams: {
    schoolId: 'school',
    yearTitle: 'year',
    titleFilter: 'filter',
    userCoursesOnly: 'mycourses'
  },
  placeholderValueTranslation: 'courses.titleFilterPlaceholder',
  newCourseTitleTranslation: 'courses.newCourseTitle',
  schoolId: null,
  yearTitle: null,
  titleFilter: null,
  years: [],
  schools: [],

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
    if(title == null){
      return this.get('content');
    }
    var exp = new RegExp(title, 'gi');
    return this.get('content').filter(function(course) {
      return course.get('title').match(exp);
    });
  }.property('debouncedFilter', 'content.@each'),
  watchSelectedSchool: function(){
    this.set('schoolId', this.get('selectedSchool.id'));
  }.observes('selectedSchool'),
  watchSelectedCohort: function(){
    this.set('yearTitle', this.get('selectedYear.title'));
  }.observes('selectedYear'),
  actions: {
    editCourse: function(course){
      this.transitionToRoute('course', course);
    },
    removeCourse: function(course){
      course.deleteRecord();
      course.save().then(function(){
        this.get('content').removeObject(course);
      });
    },
    addCourse: function(){
      var self = this;
      var course = this.store.createRecord('course', {
        title: this.get('newCourseTitle'),
        owningSchool: this.get('selectedSchool'),
        year: this.get('selectedYear.title')
      });
      course.save().then(function(){
        self.get('content').pushObject(course);
        self.transitionToRoute('course', course);
      });

    }
  },
});
