import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    var preferredDashboard = this.get('currentUser.preferredDashboard');
    this.transitionTo(preferredDashboard);
  }
});
