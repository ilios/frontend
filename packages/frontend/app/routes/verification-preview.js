import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class VerificationPreviewRoute extends Route {
  @service currentUser;
  @service session;
  @service store;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  model(params) {
    return this.store.findRecord(
      'curriculum-inventory-report',
      params.curriculum_inventory_report_id,
    );
  }
}
