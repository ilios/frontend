import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CurriculumInventoryReportReport extends Route {
  @service session;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.findRecord(
      'curriculum-inventory-report',
      params.curriculum_inventory_report_id
    );
  }
}
