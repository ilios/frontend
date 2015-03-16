import Ember from 'ember';

export default Ember.Component.extend({
  course: null,
  objectives: Ember.computed.alias('course.objectives'),
  sortedObjectives: Ember.computed.sort('objectives', function(a, b){
    return parseInt(a.get( 'id' )) - parseInt(b.get( 'id' ));
  }),
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
