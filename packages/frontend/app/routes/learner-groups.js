import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LearnerGroupsRoute extends Route {
  @service currentUser;
  @service dataLoader;
  @service session;

  queryParams = {
    filter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  model() {
    return this.dataLoader.loadSchoolsForLearnerGroups();
  }
}
