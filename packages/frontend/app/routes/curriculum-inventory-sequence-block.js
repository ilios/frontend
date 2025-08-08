import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CurriculumInventorySequenceBlockRoute extends Route {
  @service currentUser;
  @service permissionChecker;
  @service session;
  @service store;

  canUpdate = false;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  model(params) {
    return this.store.findRecord(
      'curriculum-inventory-sequence-block',
      params.curriculum_inventory_sequence_block_id,
    );
  }

  async afterModel(model) {
    const permissionChecker = this.permissionChecker;

    const report = await model.get('report');
    this.canUpdate = await permissionChecker.canUpdateCurriculumInventoryReport(report);

    //preload data to speed up rendering later
    return Promise.all([model.children, model.parent]);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
