import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  selectedTerms: [],
  term: [],
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
