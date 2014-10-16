import Ember from "ember";

var DashboardRoute = Ember.Route.extend({
	model: function() {
		return this.get('currentUser').get('events');
	},
	setupController: function(controller){
		controller.set('currentUser', this.get('currentUser'));
	}
});

export default DashboardRoute;
