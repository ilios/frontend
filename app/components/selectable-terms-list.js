import Ember from 'ember';

const { computed } = Ember;
const { sort } = computed;

export default Ember.Component.extend({
  classNames: ['selectable-terms-list'],
  tagName: 'ul',
  selectedTerms: [],
  terms: [],
  sortOrder: ['title'],
  sortedTerms: sort('terms', 'sortOrder'),
  actions: {
    add: function(term) {
      this.sendAction('add', term);

    },
    remove: function(term) {
      this.sendAction('remove', term);
    }
  }
});
