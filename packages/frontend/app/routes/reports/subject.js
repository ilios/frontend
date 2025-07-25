import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReportsSubjectRoute extends Route {
  @service currentUser;
  @service router;
  @service reporting;
  @service session;
  @service store;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  model(params) {
    return this.store.findRecord('report', params.report_id);
  }

  async afterModel(report) {
    await this.reporting.buildReportDescription(
      report.subject,
      report.prepositionalObject,
      report.prepositionalObjectTableRowId,
    );
    await this.reporting.buildReportTitle(
      report.subject,
      report.prepositionalObject,
      report.prepositionalObjectTableRowId,
    );
  }
}
