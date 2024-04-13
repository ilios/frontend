import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class UsersRoute extends Route {
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

  async afterModel() {
    return this.dataLoader.loadSchoolsForLearnerGroups();
  }
}
