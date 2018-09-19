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
    const currentUser = this.currentUser;
    const store = this.store;
    const permissionChecker = this.permissionChecker;
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
