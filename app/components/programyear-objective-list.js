import Ember from 'ember';

export default Ember.Component.extend({
  programYear: null,
  classNames: ['programyear-objective-list'],
  objectives: Ember.computed.alias('programYear.objectives'),
  sortedObjectives: Ember.computed.sort('objectives', function(a, b){
    return parseInt(a.get( 'id' )) - parseInt(b.get( 'id' ));
  }),
  actions: {
    manageDescriptors: function(objective){
      this.sendAction('manageDescriptors', objective);
    },
    mangeCompetency: function(objective){
      this.sendAction('mangeCompetency', objective);
    },
    changeObjectiveTitle: function(value, id){
      var objective = this.get('objectives').findBy('id', id);
      if(objective){
        objective.set('title', value);
        objective.save();
      }
    },
  }
});
