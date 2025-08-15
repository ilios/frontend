import { service } from '@ember/service';
import { filter } from 'rsvp';
import Route from '@ember/routing/route';

export default class UsersRoute extends Route {
  @service currentUser;
  @service store;
  @service permissionChecker;
  @service session;
  @service dataLoader;

  queryParams = {
    query: {
      replace: true,
    },

    searchTerms: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  async model() {
    const store = this.store;
    const permissionChecker = this.permissionChecker;
    const schools = await store.findAll('school');
    const schoolsWithCreateUserPermission = await filter(schools, async (school) => {
      return permissionChecker.canCreateUser(school);
    });
    const canCreate = schoolsWithCreateUserPermission.length > 0;

    return {
      canCreate,
    };
  }

  async afterModel() {
    return this.dataLoader.loadSchoolsForLearnerGroups();
  }
}
