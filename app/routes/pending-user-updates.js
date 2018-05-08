/* eslint ember/order-in-routes: 0 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { filter } from 'rsvp';

export default Route.extend({
  currentUser: service(),
  store: service(),
  permissionChecker: service(),
  titleToken: 'general.admin',
  async model(){
    const currentUser = this.get('currentUser');
    const store = this.get('store');
    const permissionChecker = this.get('permissionChecker');
    const allSchools = await store.findAll('school');
    const schools = await filter(allSchools.toArray(), async school => {
      return permissionChecker.canUpdateUserInSchool(school);
    });

    const user = await currentUser.get('model');
    const primarySchool = await user.get('school');

    return {
      primarySchool,
      schools
    };
  },
  queryParams: {
    filter: {
      replace: true
    }
  }
});
