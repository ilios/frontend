import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InstructorGroupsRoute extends Route {
  @service currentUser;
  @service store;
  @service session;

  queryParams = {
    titleFilter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  async model() {
    return this.store.findAll('school');
  }
}
