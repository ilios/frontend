import Ember from 'ember';
import LiveSearchItem from 'ilios/mixins/live-search-item';

export default Ember.Component.extend({
  editable: false,
  directorsSort: ['lastName', 'firstName'],
  directorsWithFullName: Ember.computed.filterBy('course.directors', 'fullName'),
  sortedDirectors: Ember.computed.sort('directorsWithFullName', 'directorsSort'),
  levelOptions: [1,2,3,4,5],
  directorSearchResults: [],
  actions: {
    searchDirectors: function(searchTerm){
      if(searchTerm.length < 4){
        this.set('directorSearchResults', []);
      } else {
        var self = this;
        var ResultObject = Ember.Object.extend(LiveSearchItem, {
          user: null,
          targetObject: Ember.computed.alias('user'),
          title: Ember.computed.alias('user.fullName'),
          sortTerm: function(){
            return this.get('user.lastName') + this.get('user.firstName');
          }.property('user.firstName', 'user.lastName')
        });
        this.store.find('user', {searchTerm: searchTerm}).then(function(users){

          var results = users.map(function(user){
            return ResultObject.create({
              user: user
            });
            // isActive: true,
          });
          self.set('directorSearchResults', results);
        });
      }
    },
    addDirector: function(user){
      var self = this;
      var course = this.get('course');
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
