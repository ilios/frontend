import Ember from 'ember';

export default Ember.Component.extend({
  course: null,
  objectives: Ember.computed.alias('course.objectives'),
  sortBy: ['id'],
  sortedObjectives: Ember.computed.sort('objectives', 'sortBy'),
  classNames: ['course-objective-list'],
  actions: {
    manageParents: function(objective){
      this.sendAction('manageParents', objective);
    },
    manageDescriptors: function(objective){
      this.sendAction('manageDescriptors', objective);
    }
  }
});
