import Ember from 'ember';

export default Ember.Component.extend({
  course: null,
  editable: true,
  showCheckLink: true,
  actions: {
    unpublish: function(){
      var course = this.get('course');
      course.set('publishedAsTbd', false);
      course.get('publishEvent').then(function(publishEvent){
        course.set('publishEvent', null);
        course.save();
        if(publishEvent){
          publishEvent.get('courses').then(function(courses){
            courses.removeObject(course);
            if(publishEvent.get('totalRelated') === 0){
              publishEvent.deleteRecord();
              publishEvent.save();
            }
          });
        }
      });
    },
    publishAsTbd: function(){
      var self = this;
      var course = this.get('course');
      course.set('publishedAsTbd', true);
      course.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.store.createRecord('publish-event', {
            administrator: self.get('currentUser')
          });
          publishEvent.save().then(function(){
            course.set('publishEvent', publishEvent);
            course.save();
          });
        } else {
          course.save();
        }
      });
    },
    publish: function(){
      var course = this.get('course');
      var self = this;
      course.set('publishedAsTbd', false);
      course.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.store.createRecord('publish-event', {
            administrator: self.get('currentUser')
          });
          publishEvent.save().then(function(){
            course.set('publishEvent', publishEvent);
            course.save();
          });
        } else {
          course.save();
        }
      });
    }
  }
});
