import Ember from 'ember';
import SortableByPosition from 'ilios/mixins/sortable-by-position';
import { task } from 'ember-concurrency';

const { Component } = Ember;

export default Component.extend(SortableByPosition, {
  classNames: ['objective-sort-manager'],
  sortableObjectList: null,
  subject: null,

  didReceiveAttrs() {
    this._super(...arguments);
    let subject = this.get('subject');
    this.get('loadAttr').perform(subject);

  },

  loadAttr: task(function * (subject) {
    let objectives = yield subject.get('objectives');
    this.set('sortableObjectList', objectives.toArray().sort(this.positionSortingCallback));
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
