import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  actions: {
    save: function(){
      var self = this;
      var course = this.get('course');
      course.save().then(function(course){
        if(!self.get('isDestroyed')){
          self.set('course', course);
        }
      });
    }
  }
});
