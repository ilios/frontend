import Ember from 'ember';

export default Ember.Component.extend({
  lable: null,
  on: false,
  click(){
    this.sendAction();
  }
});
