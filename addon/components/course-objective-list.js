
import Component from '@ember/component';
import SortableObjectiveList from 'ilios-common/mixins/sortable-objective-list';
import layout from '../templates/components/course-objective-list';

export default Component.extend(SortableObjectiveList, {
  layout,
  classNames: ['course-objective-list'],
  objectivesForRemovalConfirmation: null,
  editable: true,

  init(){
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
    },
  }
});
