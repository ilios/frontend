import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ProgramYearIndexRoute extends Route {
  @service permissionChecker;
  @service session;

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  /**
   * Preload the school configurations
   * to avoid a pop in later
   */
  async afterModel(programYear){
    const permissionChecker = this.permissionChecker;
    const canUpdate = await permissionChecker.canUpdateProgramYear(programYear);
    this.set('canUpdate', canUpdate);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
