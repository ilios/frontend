import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CurriculumInventoryReportReport extends Route {
  @service permissionChecker;
  @service session;
  @service store;
  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.findRecord(
      'curriculum-inventory-report',
      params.curriculum_inventory_report_id
    );
  }

  async afterModel(report) {
    const permissionChecker = this.permissionChecker;

    const canUpdate = await permissionChecker.canUpdateCurriculumInventoryReport(report);
    this.set('canUpdate', canUpdate);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
