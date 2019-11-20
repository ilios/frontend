import Component from '@ember/component';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';
import { task } from 'ember-concurrency';

export default Component.extend(SortableByPosition, {
  classNames: ['objective-sort-manager'],
  sortableObjectList: null,
  subject: null,

  didReceiveAttrs() {
    this._super(...arguments);
    let subject = this.get('subject');
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
    let objectives = yield subject.get('objectives');
    this.set('sortableObjectList', objectives.toArray().sort(this.get('positionSortingCallback')));
  }),

});
