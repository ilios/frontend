import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class VerificationPreviewRoute extends Route {
  @service session;
  @service store;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.findRecord(
      'curriculum-inventory-report',
      params.curriculum_inventory_report_id
    );
  }
}
