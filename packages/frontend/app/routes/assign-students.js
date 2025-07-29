import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { filter } from 'rsvp';

export default class AssignStudentsRoute extends Route {
  @service currentUser;
  @service permissionChecker;
  @service store;
  @service session;
  @service dataLoader;

  queryParams = {
    query: {
      replace: true,
    },
    schoolId: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    const user = await this.currentUser.getModel();
    const schools = await this.dataLoader.loadSchoolsForLearnerGroups();
    const primarySchool = await user.school;
    const schoolsWithUpdateUserPermission = await filter(schools, async (school) => {
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
