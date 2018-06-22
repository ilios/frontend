import { computed } from '@ember/object';
import Component from '@ember/component';
import SortableObjectiveList from 'ilios/mixins/sortable-objective-list';

const { alias } = computed;

export default Component.extend(SortableObjectiveList, {
  classNames: ['programyear-objective-list'],
  editable: false,
  subject: null,
  expandedObjectiveIds: null,
  programYear: alias('subject'),
  init() {
    this._super(...arguments);
    this.set('expandedObjectiveIds', []);
  },
  actions: {
    toggleExpand(objectiveId) {
      const expandedObjectiveIds = this.get('expandedObjectiveIds');
      if (expandedObjectiveIds.includes(objectiveId)) {
        expandedObjectiveIds.removeObject(objectiveId);
      } else {
        expandedObjectiveIds.pushObject(objectiveId);
      }
      this.set('expandedObjectiveIds', expandedObjectiveIds);
    }
  }
});
