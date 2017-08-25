import Ember from 'ember';
const { Component } = Ember;

export default Component.extend({
  classNames: ['clickable', 'link', 'session-table-expand'],
  click(){
    const row = this.get('row');
    row.set('expanded', !row.get('expanded'));
  }
});
