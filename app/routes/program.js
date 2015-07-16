import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  i18n: Ember.inject.service(),
  setupController: function(controller, model){
    controller.set('model', model);
    this.controllerFor('application').set('pageTitleTranslation', 'navigation.programs');
  }
});
