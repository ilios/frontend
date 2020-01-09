import Component from '@ember/component';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';
import { task } from 'ember-concurrency';

export default Component.extend(SortableByPosition, {
  classNames: ['learning-materials-sort-manager'],
  sortableObjectList: null,
  subject: null,
  'data-test-detail-learning-materials-sort-manager': true,

  didReceiveAttrs() {
    this._super(...arguments);
    const subject = this.get('subject');
    this.get('loadAttr').perform(subject);
  },
  loadAttr: task(function * (subject) {
    const learningMaterials = yield subject.get('learningMaterials');
    this.set('sortableObjectList', learningMaterials.toArray().sort(this.get('positionSortingCallback')));
  }),
  callSave: task(function* () {
    yield this.save(this.get('sortableObjectList'));
  }),
});
