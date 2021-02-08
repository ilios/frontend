import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { filter } from 'rsvp';

export default class AssignStudentsRoute extends Route {
  @service currentUser;
  @service permissionChecker;
  @service store;
  @service session;

  queryParams = {
    query: {
      replace: true
    }
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const currentUser = this.currentUser;
    const store = this.store;
    const permissionChecker = this.permissionChecker;
    const user = await currentUser.get('model');
    const schools = await store.findAll('school');
    const primarySchool = await user.get('school');
    const schoolsWithUpdateUserPermission = await filter(schools.toArray(), async school => {
      return permissionChecker.canUpdateUserInSchool(school);
    });

    return {
      primarySchool,
      schools: schoolsWithUpdateUserPermission
    };
  }
}
