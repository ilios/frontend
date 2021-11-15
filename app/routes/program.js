import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProgramRoute extends Route {
  @service permissionChecker;
  @service session;
  @service store;

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.findRecord('program', params.program_id);
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
