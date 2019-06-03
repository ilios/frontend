import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { defer } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),

  queryParams: {
    titleFilter: {
      replace: true
    }
  },

  model() {
    let rsvpDefer = defer();
    let model = {};
    this.store.findAll('school').then(schools => {
      model.schools = schools;
      rsvpDefer.resolve(model);
    });
    return rsvpDefer.promise;
  },

  actions: {
    willTransition() {
      this.controller.set('newGroup', null);
    }
  }
});
