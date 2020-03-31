import Component from '@ember/component';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { task } from 'ember-concurrency';

export default Component.extend({
  classNames: ['objective-sort-manager'],
  sortableObjectList: null,
  subject: null,

  didReceiveAttrs() {
    this._super(...arguments);
    const subject = this.get('subject');
    this.get('loadAttr').perform(subject);

  },

  loadAttr: task(function * (subject) {
    const objectives = yield subject.get('objectives');
    this.set('sortableObjectList', objectives.toArray().sort(sortableByPosition));
  }),

});
