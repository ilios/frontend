import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import config from 'ilios/config/environment';

const { RSVP, Route } = Ember;
const { all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {

  beforeModel(transition) {
    if (! config.IliosFeatures.curriculumInventory) {
      return this.transitionTo('index');
    }
    this._super(transition);
  },

  afterModel(model){
    //preload data to speed up rendering later
    return all([
      model.get('children'),
      model.get('parent'),
      model.get('report'),
    ]);
  },

  setupController: function(controller, hash){
    controller.set('model', hash);
    this.controllerFor('application').set('pageTitleTranslation', 'general.curriculumInventoryReports');
  },
});
