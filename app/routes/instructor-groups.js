import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class InstructorGroupsRoute extends Route {
  @service store;
  @service session;

  queryParams = {
    titleFilter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return this.store.findAll('school');
  }
}
