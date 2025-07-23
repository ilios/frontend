import { service } from '@ember/service';
import Route from '@ember/routing/route';

import { findRecord } from '@ember-data/legacy-compat/builders';

export default class VerificationPreviewRoute extends Route {
  @service session;
  @service store;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model(params) {
    return (await this.store.request(
      findRecord('curriculum-inventory-report', params.curriculum_inventory_report_id)
    )).content;
  }
}
