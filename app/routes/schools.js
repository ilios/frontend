import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, inject } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  model(){
    return this.get('store').findAll('school');
  },
  setupController: function(controller, model){
    this._super(...arguments);
    controller.set('model', model);
    this.controllerFor('application').set('pageTitleTranslation', 'general.schools');
  },
});
