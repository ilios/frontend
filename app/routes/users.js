import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class UsersRoute extends Route {
  @service session;

  queryParams = {
    query: {
      replace: true
    },

    searchTerms: {
      replace: true
    }
  }

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
