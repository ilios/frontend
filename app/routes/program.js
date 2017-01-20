import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  setupController: function(controller, model){
    controller.set('model', model);
    this.controllerFor('application').set('pageTitleTranslation', 'general.programs');
  }
});
