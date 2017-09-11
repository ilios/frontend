import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['update-notification'],
  click() {
    window.location.reload();
  }
});
