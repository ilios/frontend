import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  store: service(),
  permissionChecker: service(),
  canUpdate: false,
  async afterModel(report) {
    await report.get('topLevelSequenceBlocks');

    const permissionChecker = this.permissionChecker;
    const canUpdate = await permissionChecker.canUpdateCurriculumInventoryReport(report);

    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.canUpdate);
  },
});
