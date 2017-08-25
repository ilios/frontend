import Ember from 'ember';
const { Component } = Ember;

export default Component.extend({
  classNames: ['session-table-actions'],
  actions: {
    confirmDelete(){
      const row = this.get('row');
      row.set('expanded', true);
      row.set('confirmDelete', true);
    },
  }
});
