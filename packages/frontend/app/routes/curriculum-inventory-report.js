import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { findRecord } from '@ember-data/legacy-compat/builders';

export default class CurriculumInventoryReportReport extends Route {
  @service session;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    return (await this.store.request(
      findRecord('curriculum-inventory-report', params.curriculum_inventory_report_id)
    )).content;
  }
}
