import Component from '@ember/component';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';
import { task } from 'ember-concurrency';

export default Component.extend(SortableByPosition, {
  classNames: ['learning-materials-sort-manager'],
  sortableObjectList: null,
  subject: null,

  didReceiveAttrs() {
    this._super(...arguments);
    const subject = this.get('subject');
    this.get('loadAttr').perform(subject);

  },

  actions: {
    cancel(){
      this.cancel();
    },
    save() {
      this.save(this.get('sortableObjectList'));
    }
  },
  loadAttr: task(function * (subject) {
    const learningMaterials = yield subject.get('learningMaterials');
    this.set('sortableObjectList', learningMaterials.toArray().sort(this.get('positionSortingCallback')));
  }),

});
