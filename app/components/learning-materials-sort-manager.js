import Ember from 'ember';
import SortableByPosition from 'ilios/mixins/sortable-by-position';
import { task } from 'ember-concurrency';

const { Component } = Ember;

export default Component.extend(SortableByPosition, {
  sortableObjectList: null,
  subject: null,

  didReceiveAttrs() {
    this._super(...arguments);
    let subject = this.get('subject');
    this.get('loadAttr').perform(subject);

  },

  loadAttr: task(function * (subject) {
    let learningMaterials = yield subject.get('learningMaterials');
    this.set('sortableObjectList', learningMaterials.toArray().sort(this.get('learningMaterialSortingCallback')));
  }),

  actions: {
    cancel(){
      this.sendAction('cancel');
    },
    save() {
      this.sendAction('save', this.get('sortableObjectList'));
    }
  }
});
