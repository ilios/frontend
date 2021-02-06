import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProgramRoute extends Route {
  @service permissionChecker;
  @service session;

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async afterModel(program) {
    const permissionChecker = this.permissionChecker;
    const canUpdate = await permissionChecker.canUpdateProgram(program);
    this.set('canUpdate', canUpdate);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
