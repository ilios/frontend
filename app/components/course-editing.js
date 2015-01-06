import Ember from 'ember';

export default Ember.Component.extend({
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
