import Ember from 'ember';
import SortableObjectiveList from 'ilios/mixins/sortable-objective-list';

const { computed, Component } = Ember;
const { alias } = computed;

export default Component.extend(SortableObjectiveList, {
  classNames: ['session-objective-list'],
  objectivesForRemovalConfirmation: [],
  session: alias('subject'),

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
