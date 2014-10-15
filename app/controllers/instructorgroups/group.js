import Ember from 'ember';

export default Ember.ObjectController.extend({
  breadCrumb: Ember.computed.oneWay('model.title'),
  bufferedTitle: Ember.computed.oneWay('model.title'),
  isDirty: false,
  userFilter: '',
  courseFilter: '',
  searchTerms: '',
  showResults: false,
  searchResults: [],
  hasResults: function(){
    return this.get('searchResults').length > 0;
  }.property('searchResults'),
  titleObserver: function(){
    var same = this.get('bufferedTitle') === this.get('model.title');
    this.set('isDirty', !same);
  }.observes('bufferedTitle', 'model.title'),
  filteredUsers: function(){
    var filter = this.get('userFilter');
    var exp = new RegExp(filter, 'gi');
    var instructors = this.get('model.users');

    var filtered = instructors.filter(function(instructor) {
      return instructor.get('fullName').match(exp) || instructor.get('email').match(exp);
    });
    return filtered.sortBy('lastName', 'firstName');
  }.property('model.users.@each', 'userFilter'),
  filteredCourses: function(){
    var filter = this.get('courseFilter');
    var exp = new RegExp(filter, 'gi');
    var courses = this.get('model.courses');

    var filtered = courses.filter(function(course) {
      return course.get('title').match(exp);
    });
    return filtered.sortBy('title');
  }.property('model.courses.@each', 'courseFilter'),
  showInstructorPicker: false,
  actions: {
    toggleInstructorPickerVisibility: function(){
      this.toggleProperty('showInstructorPicker');
    },
    addInstructor: function(instructor){
      var self = this;
      this.get('model.users').then(function(users){
        users.addObject(instructor);
        self.set('isDirty', true);
      });
    },
    removeInstructor: function(instructor){
      var self = this;
      this.get('model.users').then(function(users){
        users.removeObject(instructor);
        self.set('isDirty', true);
      });
    },
    searchInstructors: function(){
      var self = this;
      if(this.get('searchTerm').length < 1){
        this.set('showResults', false);
        return;
      }
      this.store.find('user', {searchTerm: this.get('searchTerm')}).then(function(results){
        self.set('searchResults', results.sortBy('lastName', 'firstName'));
        self.set('showResults', true);
      });
    },
    save: function(){
      var self = this;
      var bufferedTitle = this.get('bufferedTitle').trim();
      var instructorGroup = this.get('model');
      instructorGroup.set('title', bufferedTitle);
      instructorGroup.save().then(function(){
        self.set('isDirty', false);
      });
    }
  }
});
