import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

const { RSVP, inject, Route } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  model() {
    let defer = RSVP.defer();
    this.get('currentUser.model').then(currentUser=>{
      currentUser.get('schools').then(schools => {
        defer.resolve(schools);
      });
    });

    return defer.promise;
  },
  setupController: function(controller, schools){
    controller.set('model', schools);
    this.controllerFor('application').set('pageTitleTranslation', 'navigation.programs');
  },
  queryParams: {
    filter: {
      replace: true
    }
  },

  actions: {
    reloadModel() {
      this.refresh();
    }
  }
});
