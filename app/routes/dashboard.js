import Ember from "ember";

var DashboardRoute = Ember.Route.extend({
  currentUser: Ember.inject.service(),
	model: function() {
		return this.get('currentUser').get('events');
	},
	setupController: function(controller, model){
    controller.set('model', model);
    controller.set('currentUser', this.get('currentUser'));
		this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.dashboard'));
	}
});

export default DashboardRoute;
