import Ember from 'ember';

const { Component, computed } = Ember;
const { not } = computed;

export default Component.extend({
  editable: not('course.locked'),
  objectiveDetails: false,
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
    toggleObjectiveDetails(){
      this.sendAction('toggleObjectiveDetails');
    }
  }
});
