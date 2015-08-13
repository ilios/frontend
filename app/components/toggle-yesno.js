import Ember from 'ember';

export default Ember.Component.extend({
  lable: null,
  yes: false,
  click(){
    this.sendAction();
  }
});
