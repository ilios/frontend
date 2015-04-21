import Ember from 'ember';

export default Ember.Component.extend({
  currentUser: Ember.inject.service(),
  userName: Ember.computed.oneWay('currentUser.model.fullName'),
});
