import Ember from 'ember';

const { computed, Component } = Ember;
const { sort } = computed;

export default Component.extend({
  classNames: ['session-objective-list'],
  objectivesForRemovalConfirmation: [],
  session: null,

  objectives: computed('session.objectives.[]', function(){
    return this.get('session').get('objectives');
  }),
  sortedObjectives: sort('objectives', function(a, b){
    return parseInt(a.get( 'id' )) - parseInt(b.get( 'id' ));
  }),

  actions: {
    remove(objective){
      objective.deleteRecord();
      objective.save();
    },
    cancelRemove(objective){
      this.get('objectivesForRemovalConfirmation').removeObject(objective.get('id'));
    },
    confirmRemoval(objective){
      this.get('objectivesForRemovalConfirmation').pushObject(objective.get('id'));
    }
  }
});
