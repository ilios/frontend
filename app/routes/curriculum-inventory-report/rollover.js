import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CurriculumInventoryReportReport extends Route {
  @service permissionChecker;
  @service session;
  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async afterModel(report) {
    const permissionChecker = this.permissionChecker;
    const canUpdate = await permissionChecker.canUpdateCurriculumInventoryReport(report);
    this.set('canUpdate', canUpdate);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('hasUpdatePermissions', this.canUpdate);
  }
}
