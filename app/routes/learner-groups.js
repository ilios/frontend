import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LearnerGroupsRoute extends Route {
  @service dataLoader;
  @service session;

  queryParams = {
    titleFilter: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model() {
    return this.dataLoader.loadSchoolsForLearnerGroups();
  }

  @action
  willTransition() {
    this.controller.set('newGroup', null);
  }
}
