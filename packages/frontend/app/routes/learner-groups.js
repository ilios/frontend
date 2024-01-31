import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LearnerGroupsRoute extends Route {
  @service dataLoader;
  @service session;

  queryParams = {
    filter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model() {
    return this.dataLoader.loadSchoolsForLearnerGroups();
  }
}
