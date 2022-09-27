import Route from '@ember/routing/route';
import { filter } from 'rsvp';
import { inject as service } from '@ember/service';

export default class AdminDashboardRoute extends Route {
  @service store;
  @service permissionChecker;
  @service currentUser;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    const currentUser = this.currentUser;
    const performsNonLearnerFunction = currentUser.get('performsNonLearnerFunction');
    if (!performsNonLearnerFunction) {
      this.transitionTo('dashboard');
    }
  }

  async model() {
    const store = this.store;
    const permissionChecker = this.permissionChecker;
    const schools = await store.findAll('school');
    const schoolsWithCreateUserPermission = await filter(schools.slice(), async (school) => {
      return permissionChecker.canCreateUser(school);
    });
    const canCreate = schoolsWithCreateUserPermission.length > 0;
    const schoolsWithUpdateUserPermission = await filter(schools.slice(), async (school) => {
      return permissionChecker.canUpdateUserInSchool(school);
    });

    return {
      canCreate,
      schoolsWithUpdateUserPermission,
    };
  }
}
