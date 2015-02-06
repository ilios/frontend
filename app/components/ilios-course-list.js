import Ember from 'ember';

export default Ember.Component.extend({
  courses: [],
  sortBy: ['title'],
  sortedCourses: Ember.computed.sort('courses', 'sortBy'),
  actions: {
    edit: function(course){
      this.sendAction('edit', course);
    },
    remove: function(course){
      this.sendAction('remove', course);
    },
  }
});
