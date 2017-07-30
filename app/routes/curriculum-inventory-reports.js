import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { RSVP, Route } = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: Ember.inject.service(),
  store: Ember.inject.service(),
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
