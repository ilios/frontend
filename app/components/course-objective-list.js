/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import SortableObjectiveList from 'ilios/mixins/sortable-objective-list';

const { alias } = computed;

export default Component.extend(SortableObjectiveList, {
  init(){
    this._super(...arguments);
    this.set('objectivesForRemovalConfirmation', []);
  },
  classNames: ['course-objective-list'],
  objectivesForRemovalConfirmation: null,
  editable: true,
  course: alias('subject'),

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
    },
  }
});
