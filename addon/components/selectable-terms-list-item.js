/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/selectable-terms-list-item';

export default Component.extend({
  layout,
  selectedTerms: null,
  term: null,
  tagName: 'div',
  classNameBindings: [':selectable-terms-list-item', 'isSelected:selected'],

  isSelected: computed('term', 'selectedTerms.[]', function() {
    let term = this.get('term');
    let selectedTerms = this.get('selectedTerms');
    return selectedTerms.includes(term);
  }),

  click() {
    let term = this.get('term');
    if (this.get('isSelected')) {
      this.sendAction('remove', term);
    } else {
      this.sendAction('add', term);
    }
  },
});
