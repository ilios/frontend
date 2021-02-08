import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CurriculumInventoryReportIndexRoute extends Route {
  @service store;
  @service permissionChecker;
  @service session;

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async afterModel(report) {
    await report.get('topLevelSequenceBlocks');

    const permissionChecker = this.permissionChecker;
    const canUpdate = await permissionChecker.canUpdateCurriculumInventoryReport(report);

    this.set('canUpdate', canUpdate);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
