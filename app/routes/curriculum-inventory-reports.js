import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import config from 'ilios/config/environment';

const { RSVP, inject, Route } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  store: service(),

  beforeModel(transition) {
    if (! config.IliosFeatures.curriculumInventory) {
      return this.transitionTo('index');
    }
    this._super(transition);
  },

  model() {
    let defer = RSVP.defer();
    this.get('currentUser.model').then(currentUser => {
      currentUser.get('schools').then(schools => {
        defer.resolve(schools);
      });
    });

    return defer.promise;
  },

  setupController: function(controller, hash){
    controller.set('model', hash);
    this.controllerFor('application').set('pageTitleTranslation', 'general.curriculumInventoryReports');
  },
});
