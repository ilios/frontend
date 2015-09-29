import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['checkbox'],

  tagName: 'span',

  value: false,

  click() {
    this.sendAction();
  }
});
