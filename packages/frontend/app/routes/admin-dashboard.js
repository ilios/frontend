import Route from '@ember/routing/route';
import { filter } from 'rsvp';
import { service } from '@ember/service';

import { findAll } from '@ember-data/legacy-compat/builders';

export default class AdminDashboardRoute extends Route {
  @service store;
  @service permissionChecker;
  @service currentUser;
  @service router;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    const currentUser = this.currentUser;
    const performsNonLearnerFunction = currentUser.get('performsNonLearnerFunction');
    if (!performsNonLearnerFunction) {
      this.router.transitionTo('dashboard');
    }
  }

  async model() {
    const store = this.store;
    const permissionChecker = this.permissionChecker;
    const {
      content: schools
    } = await store.request(findAll('school'));
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
