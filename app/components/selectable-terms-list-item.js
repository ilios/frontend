/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  selectedTerms: null,
  term: null,
  tagName: 'div',
  classNameBindings: [':selectable-terms-list-item', 'isSelected:selected'],

  isSelected: computed('term', 'selectedTerms.[]', function() {
    let term = this.term;
    let selectedTerms = this.selectedTerms;
    return selectedTerms.includes(term);
  }),

  click() {
    let term = this.term;
    if (this.isSelected) {
      this.sendAction('remove', term);
    } else {
      this.sendAction('add', term);
    }
  },
});
