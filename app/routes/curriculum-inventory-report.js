import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import config from 'ilios/config/environment';


const { Route } = Ember;

export default Route.extend(AuthenticatedRouteMixin, {

  beforeModel(transition) {
    if (! config.IliosFeatures.curriculumInventory) {
      return this.transitionTo('index');
    }
    this._super(transition);
  },

  setupController: function(controller, hash){
    controller.set('model', hash);
    this.controllerFor('application').set('pageTitleTranslation', 'general.curriculumInventoryReports');
  },
});
