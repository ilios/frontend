import Ember from 'ember';

export default Ember.Component.extend({
  label: null,
  yes: false,
  click(){
    this.sendAction();
  }
});
