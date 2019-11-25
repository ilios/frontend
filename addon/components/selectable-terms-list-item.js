import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  selectedTerms: null,
  term: null,
  tagName: 'div',
  classNameBindings: [':selectable-terms-list-item', 'isSelected:selected'],

  isSelected: computed('term', 'selectedTerms.[]', function() {
    const term = this.get('term');
    const selectedTerms = this.get('selectedTerms');
    return selectedTerms.includes(term);
  }),

  click() {
    const term = this.get('term');
    if (this.get('isSelected')) {
      this.remove(term);
    } else {
      this.add(term);
    }
  },
});
