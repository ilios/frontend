import Ember from 'ember';

export default Ember.Route.extend({
    afterModel: function() {
        var preferedDashboard = this.get('currentUser.preferedDashboard');
        this.transitionTo(preferedDashboard);
    }
});
