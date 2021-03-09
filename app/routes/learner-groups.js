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
    //@todo refactor away from doing this work in the route [JJ 3/21]
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor('user');
    controller.set('newGroup', null);
  }
}
