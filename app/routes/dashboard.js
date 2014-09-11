import Ember from "ember";
import CurrentUser from '../mixins/current-user';

var DashboardRoute = Ember.Route.extend(CurrentUser, {
	model: function() {
		return this.get('currentUser').get('events');
	},
	setupController: function(controller){
		controller.set('currentUser', this.get('currentUser'));
	}
});

export default DashboardRoute;
