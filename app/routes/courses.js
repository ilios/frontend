/* eslint ember/order-in-routes: 0 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  store: service(),
  titleToken: 'general.coursesAndSessions',
  model() {
    let defer = RSVP.defer();
    let model = {};
    this.get('currentUser.model').then(currentUser=>{
      this.store.findAll('school').then(schools => {
        model.schools = schools;
        currentUser.get('school').then(primarySchool => {
          model.primarySchool = primarySchool;
          this.store.findAll('academic-year').then(years => {
            model.years = years.toArray();

            defer.resolve(model);
          });
        });
      });
    });

    return defer.promise;
  },
  queryParams: {
    titleFilter: {
      replace: true
    }
  }
});
