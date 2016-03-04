import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  tagName: 'li',
  canEdit: false,
  term: null,
  tooltipContent: computed('term.description', function() {
    return this.get('term.description');
  }),
  click: function() {
    if (this.get('canEdit')) {
      let term = this.get('term');
      this.sendAction('remove', term);
    }
  },
});
