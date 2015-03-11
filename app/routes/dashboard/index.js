import Ember from 'ember';

export default Ember.Route.extend({
  currentUser: Ember.inject.service('currentUser'),
  beforeModel: function() {
    var preferredDashboard = this.get('currentUser').get('preferredDashboard');
    this.transitionTo(preferredDashboard);
  }
});
