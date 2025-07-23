import { service } from '@ember/service';
import { filter } from 'rsvp';
import Route from '@ember/routing/route';

import { findAll } from '@ember-data/legacy-compat/builders';

export default class UsersRoute extends Route {
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

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
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

    return {
      canCreate,
    };
  }

  async afterModel() {
    return this.dataLoader.loadSchoolsForLearnerGroups();
  }
}
