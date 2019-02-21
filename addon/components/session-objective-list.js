
import { computed } from '@ember/object';
import Component from '@ember/component';
import SortableObjectiveList from 'ilios-common/mixins/sortable-objective-list';
import layout from '../templates/components/session-objective-list';

const { alias } = computed;

export default Component.extend(SortableObjectiveList, {
  layout,
  classNames: ['session-objective-list'],
  objectivesForRemovalConfirmation: null,
  session: alias('subject'),

  init() {
    this._super(...arguments);
    this.set('objectivesForRemovalConfirmation', []);
  },
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
