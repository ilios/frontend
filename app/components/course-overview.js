import Ember from 'ember';
import LiveSearchItem from 'ilios/mixins/live-search-item';

export default Ember.Component.extend({
  editable: false,
  directorsSort: ['lastName', 'firstName'],
  directorsWithFullName: Ember.computed.filterBy('course.directors', 'fullName'),
  sortedDirectors: Ember.computed.sort('directorsWithFullName', 'directorsSort'),
  levelOptions: [1,2,3,4,5],
  directorSearchResults: [],
  directorSearchReturned: false,
  directorSearchStarted: false,
  directorSearchTerm: null,
  /**
   * Do the search here so we can debounce it in the action.
   */
  runSearch: function(){
    this.set('directorSearchReturned', false);
    var self = this;
    var searchTerm = this.get('directorSearchTerm');
    var directors = this.get('course.directors');
    var ResultObject = Ember.Object.extend(LiveSearchItem, {
      user: null,
      directors: [],
      targetObject: Ember.computed.alias('user'),
      title: function(){
        return this.get('user.fullName') + ' ' +
          this.get('user.email');
      }.property('user.fullName', 'user.email'),
      isActive: function(){
        return !this.get('directors').contains(this.get('user'));
      }.property('user', 'directors.@each'),
      sortTerm: function(){
        return this.get('user.lastName') + this.get('user.firstName');
      }.property('user.firstName', 'user.lastName')
    });
    this.set('directorSearchStarted', true);
    this.store.find('user', {searchTerm: searchTerm}).then(function(users){
      var results = users.map(function(user){
        return ResultObject.create({
          user: user,
          directors: directors
        });
      });
      self.set('directorSearchResults', results);
      self.set('directorSearchStarted', false);
      self.set('directorSearchReturned', true);
    });
  },
  actions: {
    searchDirectors: function(searchTerm){
      this.set('directorSearchReturned', false);
      if(searchTerm){
        this.set('directorSearchTerm', searchTerm);
        this.set('directorSearchStarted', true);
        Ember.run.debounce(this, this.runSearch, 500);
      }
    },
    addDirector: function(user){
      var self = this;
      var course = this.get('course');
      this.set('directorSearchReturned', false);
      course.get('directors').then(function(directors){
        directors.pushObject(user);
        user.get('directedCourses').then(function(courses){
          courses.pushObject(course);
          user.save();
          course.save().then(function(){
            self.set('course', course);
          });
        });
      });
    },

  }
});
