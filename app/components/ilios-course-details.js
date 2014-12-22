import Ember from 'ember';
import LiveSearchItem from 'ilios/mixins/live-search-item';

export default Ember.Component.extend({
  levelOptions: [1,2,3,4,5],
  directorSearchResults: [],
  directorSearchTerm: '',
  matchingDirectors: [],
  directorsSort: ['lastName', 'firstName'],
  sortedDirectors: Ember.computed.sort('course.directors', 'directorsSort'),
  watchDirectorSearchTerm: function(){
    var self = this;
    var searchTerm = this.get('directorSearchTerm');
    if(searchTerm.length === 0){
      this.set('matchingDirectors', []);
    } else {
      this.store.find('user', {searchTerm: searchTerm}).then(function(users){
        self.set('matchingDirectors', users);
      });
    }
  }.observes('directorSearchTerm'),
  replaceDirectorSearchResults: function(){
    var self = this;
    this.get('course.directors').then(function(directors){
      var results = self.get('matchingDirectors').map(function(user){
        return Ember.Object.extend(LiveSearchItem, {
          title: user.get('fullName'),
          isActive: !directors.contains(user),
          targetObject: user,
          sortTerm: user.get('lastName') + user.get('firstName')
        }).create();
      });
      self.set('directorSearchResults', results);
    });
  }.observes('matchingDirectors.@each', 'course.directors.@each'),
  actions: {
    save: function(){
      var self = this;
      var course = this.get('course');
      course.save().then(function(course){
        if(!self.get('isDestroyed')){
          self.set('course', course);
        }
      });
    },
    searchDirectors: function(searchTerm){
      this.set('directorSearchTerm', searchTerm);
    },
    addDirector: function(user){
      var course = this.get('course');
      course.get('directors').then(function(directors){
        user.get('directedCourses').then(function(courses){
          courses.addObject(course);
          directors.addObject(user);
          course.save();
          user.save();
        });
      });
    },
    removeDirector: function(user){
      var self = this;
      user.get('directedCourses').then(function(courses){
        var course = self.get('course');
        courses.removeObject(course);
        course.get('directors').then(function(directors){
          directors.removeObject(user);
          user.save();
          course.save();
        });
      });
    }
  }

});
