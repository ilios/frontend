import Ember from 'ember';

export default Ember.Route.extend({
    afterModel: function() {
        var preferredDashboard = this.get('currentUser.preferredDashboard');
        this.transitionTo(preferredDashboard);
    }
});
