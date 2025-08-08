import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SessionIndexRoute extends Route {
  @service permissionChecker;
  @service store;
  @service session;
  @service currentUser;
  @service router;

  canUpdate = false;

  queryParams = {
    sessionObjectiveDetails: {
      replace: true,
    },
    sessionTaxonomyDetails: {
      replace: true,
    },
    sessionLeadershipDetails: {
      replace: true,
    },
    sessionManageLeadership: {
      replace: true,
    },
    addOffering: {
      replace: true,
    },
  };

  async afterModel(session) {
    this.canUpdate = await this.permissionChecker.canUpdateSession(session);
  }

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
