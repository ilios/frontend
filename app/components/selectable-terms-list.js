import Component from '@ember/component';
import { computed } from '@ember/object';
const { sort } = computed;

export default Component.extend({
  classNames: ['selectable-terms-list'],
  tagName: 'ul',
  selectedTerms: [],
  terms: [],
  sortOrder: ['title'],
  sortedTerms: sort('terms', 'sortOrder'),
  actions: {
    add(term) {
      this.sendAction('add', term);

    },
    remove(term) {
      this.sendAction('remove', term);
    }
  }
});
