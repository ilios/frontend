import Ember from "ember";

var DashboardRoute = Ember.Route.extend({
	model: function() {
		return this.get('currentUser').get('events');
	}
});

export default DashboardRoute;
