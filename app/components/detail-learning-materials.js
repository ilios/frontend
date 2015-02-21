import Ember from 'ember';

export default Ember.Component.extend({
  isCourse: false,
  isSession: Ember.computed.not('isCourse'),
});
