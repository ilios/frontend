import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { filter } from 'rsvp';

export default Route.extend({
  currentUser: service(),
  permissionChecker: service(),
  store: service(),

  queryParams: {
    filter: {
      replace: true
    }
  },

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
    return { primarySchool, schools };
  }
});
