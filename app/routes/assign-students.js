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
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const user = await this.currentUser.getModel();
    const schools = await this.store.findAll('school');
    const primarySchool = await user.get('school');
    const schoolsWithUpdateUserPermission = await filter(schools.toArray(), async (school) => {
      return this.permissionChecker.canUpdateUserInSchool(school);
    });

    const unassignedStudents = await this.store.query('user', {
      filters: {
        cohorts: null,
        enabled: true,
        roles: [4],
      },
    });

    return {
      primarySchool,
      schools: schoolsWithUpdateUserPermission,
      unassignedStudents,
    };
  }
}
