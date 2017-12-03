/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  selectedTerms: null,
  term: null,
  tagName: 'div',
  classNameBindings: ['isSelected:selected'],

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
