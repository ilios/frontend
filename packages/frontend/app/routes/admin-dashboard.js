import Route from '@ember/routing/route';
import { filter } from 'rsvp';
import { service } from '@ember/service';

export default class AdminDashboardRoute extends Route {
  @service store;
  @service permissionChecker;
  @service currentUser;
  @service router;
  @service session;

  beforeModel(transition) {
    if (!this.currentUser.requireNonLearner(transition)) {
      this.router.transitionTo('dashboard');
    }
  }

  async model() {
    const store = this.store;
    const permissionChecker = this.permissionChecker;
    const schools = await store.findAll('school');
    const schoolsWithCreateUserPermission = await filter(schools, async (school) => {
      return permissionChecker.canCreateUser(school);
    });
    const canCreate = schoolsWithCreateUserPermission.length > 0;
    const schoolsWithUpdateUserPermission = await filter(schools, async (school) => {
      return permissionChecker.canUpdateUserInSchool(school);
    });

    return {
      canCreate,
      schoolsWithUpdateUserPermission,
    };
  }
}
