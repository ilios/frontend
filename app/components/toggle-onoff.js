import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['toggle-onoff'],

  lable: null,
  on: false,

  click() {
    this.sendAction();
  }
});
