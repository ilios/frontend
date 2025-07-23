import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { findRecord } from '@ember-data/legacy-compat/builders';

export default class CurriculumInventorySequenceBlockRoute extends Route {
  @service permissionChecker;
  @service session;
  @service store;

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    return (await this.store.request(findRecord(
      'curriculum-inventory-sequence-block',
      params.curriculum_inventory_sequence_block_id
    ))).content;
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
