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
    return selectedTerms.contains(term);
  }),

  tooltipContent: computed('term.description', function() {
    return this.get('term.description');
  }),

  click: function() {
    let term = this.get('term');
    if (this.get('isSelected')) {
      this.sendAction('remove', term);
    } else {
      this.sendAction('add', term);
    }
  },
});
