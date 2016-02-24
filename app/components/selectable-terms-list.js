import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['selectable-terms-list'],
  tagName: 'ul',
  selectedTerms: [],
  terms: [],
  actions: {
    add: function(term) {
      this.sendAction('add', term);

    },
    remove: function(term) {
      this.sendAction('remove', term);
    }
  }
});
