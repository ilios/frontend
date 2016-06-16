import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  tagName: 'li',
  canEdit: false,
  term: null,
  click: function() {
    if (this.get('canEdit')) {
      let term = this.get('term');
      this.sendAction('remove', term);
    }
  },
});
