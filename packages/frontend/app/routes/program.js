import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ProgramRoute extends Route {
  @service permissionChecker;
  @service session;
  @service store;

  queryParams = {
    leadershipDetails: {
      replace: true,
    },
    manageLeadership: {
      replace: true,
    },
  };

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.findRecord('program', params.program_id);
  }

  async afterModel(program) {
    const permissionChecker = this.permissionChecker;
    this.canUpdate = await permissionChecker.canUpdateProgram(program);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
