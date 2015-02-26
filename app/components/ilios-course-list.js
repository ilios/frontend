import Ember from 'ember';

export default Ember.Component.extend({
  courses: [],
  proxiedCourses: function(){
    return this.get('courses').map(function(course){
      return Ember.ObjectProxy.create({
        content: course,
        showRemoveConfirmation: false
      });
    });
  }.property('courses.@each'),
  actions: {
    edit: function(courseProxy){
      this.sendAction('edit', courseProxy.get('content'));
    },
    remove: function(courseProxy){
      this.sendAction('remove', courseProxy.get('content'));
    },
    cancelRemove: function(courseProxy){
      courseProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove: function(courseProxy){
      courseProxy.set('showRemoveConfirmation', true);
    },
  }
});
