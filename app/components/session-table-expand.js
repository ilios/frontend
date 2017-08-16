import Ember from 'ember';
const { Component } = Ember;

export default Component.extend({
  classNames: ['clickable'],
  click(){
    const row = this.get('row');
    row.set('expanded', !row.get('expanded'));
  }
});
