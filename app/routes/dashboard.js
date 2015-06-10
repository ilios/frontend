import Ember from "ember";

var DashboardRoute = Ember.Route.extend({
	setupController: function(){
    this._super.apply(arguments);
		this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.dashboard'));
	}
});

export default DashboardRoute;
