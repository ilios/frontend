import Ember from 'ember';

export default Ember.Component.extend({
  session: null,
  classNames: ['session-objective-list'],
  objectives: Ember.computed.alias('session.objectives'),
  sortedObjectives: Ember.computed.sort('objectives', function(a, b){
    return parseInt(a.get( 'id' )) - parseInt(b.get( 'id' ));
  }),
  actions: {
    manageParents: function(objective){
      this.sendAction('manageParents', objective);
    },
    manageDescriptors: function(objective){
      this.sendAction('manageDescriptors', objective);
    }
  }
});
