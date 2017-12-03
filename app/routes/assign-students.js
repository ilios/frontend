/* eslint ember/order-in-routes: 0 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  titleToken: 'general.admin',
  model(){
    return this.get('currentUser.model').then(user => {
      return user.get('schools').then(schools => {
        return user.get('school').then(primarySchool => {
          return {
            primarySchool,
            schools
          };
        });
      });
    });
  },
  queryParams: {
    filter: {
      replace: true
    }
  }
});
