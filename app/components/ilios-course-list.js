import Ember from 'ember';

export default Ember.Component.extend({
  courses: [],
  actions: {
    edit: function(course){
      this.sendAction('edit', course);
    },
    remove: function(course){
      this.sendAction('remove', course);
    },
  }
});
