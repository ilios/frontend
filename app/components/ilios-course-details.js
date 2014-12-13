import Ember from 'ember';

export default Ember.Component.extend({
  levelOptions: [1,2,3,4,5],
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
  }

});
