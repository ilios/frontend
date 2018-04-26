/* eslint ember/order-in-routes: 0 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.learnerGroups',
  model() {
    let defer = RSVP.defer();
    let model = {};
    this.get('store').findAll('school', { reload: true }).then(schools => {
      model.schools = schools;
      defer.resolve(model);
    });

    return defer.promise;
  },
  queryParams: {
    titleFilter: {
      replace: true
    }
  }
});
