import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  label: null,
  yes: false,
  tagName: 'span',
  classNames: ['switch', 'yes-no', 'switch-green'],
  click(){
    const yes = this.get('yes');
    this.get('toggle')(!yes);
  }
});
