import Ember from 'ember';

export default Ember.Component.extend({
  availableTopics: [],
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
    addCohort: function(cohort){
      var course = this.get('course');
      course.get('cohorts').then(function(cohorts){
        cohort.get('courses').then(function(courses){
          courses.addObject(course);
          cohorts.addObject(cohort);
          course.save();
          cohort.save();
        });
      });
    }
  }

});
