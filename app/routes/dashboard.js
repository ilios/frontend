import Ember from "ember";
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	i18n: Ember.inject.service(),
	today: new Date(),
	setupController: function(){
    this._super.apply(arguments);
		this.controllerFor('application').set('pageTitleTranslation', 'navigation.dashboard');
	}
});
