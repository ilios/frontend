import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route } = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  setupController: function(controller, model){
    this._super(...arguments);
    controller.set('model', model);
    this.controllerFor('application').set('pageTitleTranslation', 'general.schools');
  }
});
