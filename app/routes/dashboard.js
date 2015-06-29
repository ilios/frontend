import Ember from "ember";
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	setupController: function(){
    this._super.apply(arguments);
		this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.dashboard'));
	}
});
