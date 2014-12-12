import Ember from "ember";

var DashboardRoute = Ember.Route.extend({
	model: function() {
		return this.get('currentUser').get('events');
	},
	setupController: function(){
		this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.dashboard'));
	}
});

export default DashboardRoute;
