import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { RSVP, inject, Route } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  store: service(),
  titleToken: 'general.curriculumInventoryReports',

  model() {
    let defer = RSVP.defer();
    this.get('currentUser.model').then(currentUser => {
      currentUser.get('schools').then(schools => {
        defer.resolve(schools);
      });
    });

    return defer.promise;
  },
});
