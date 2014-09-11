import Ember from 'ember';

export default Ember.Route.extend({
    //@todo user should be able to save their prefered dashboard
    afterModel: function() {
        this.transitionTo('dashboard.week');
    }
});
