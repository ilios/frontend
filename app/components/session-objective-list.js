/* eslint ember/order-in-components: 0 */
import { computed } from '@ember/object';
import Component from '@ember/component';
import SortableObjectiveList from 'ilios/mixins/sortable-objective-list';

const { alias } = computed;

export default Component.extend(SortableObjectiveList, {
  init() {
    this._super(...arguments);
    this.set('objectivesForRemovalConfirmation', []);
  },
  classNames: ['session-objective-list'],
  objectivesForRemovalConfirmation: null,
  session: alias('subject'),

  actions: {
    remove(objective){
      objective.deleteRecord();
      objective.save();
    },
    cancelRemove(objective){
      this.objectivesForRemovalConfirmation.removeObject(objective.get('id'));
    },
    confirmRemoval(objective){
      this.objectivesForRemovalConfirmation.pushObject(objective.get('id'));
    }
  }
});
