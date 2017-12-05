/* eslint ember/order-in-routes: 0 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
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
