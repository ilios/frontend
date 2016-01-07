import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { RSVP, inject } = Ember;
const { service } = inject;

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  store: service(),
  model() {
    let defer = RSVP.defer();
    let model = {};
    this.get('currentUser.model').then(currentUser=>{
      currentUser.get('schools').then(schools => {
        model.schools = schools;
        defer.resolve(model);
      });
    });

    return defer.promise;
  },
  setupController: function(controller, hash){
    controller.set('model', hash);
    this.controllerFor('application').set('pageTitleTranslation', 'navigation.learnerGroups');
  },
  queryParams: {
    filter: {
      replace: true
    }
  }
});
