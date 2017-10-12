import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

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
