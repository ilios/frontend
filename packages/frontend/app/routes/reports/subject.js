import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReportsSubjectRoute extends Route {
  @service currentUser;
  @service router;
  @service reporting;
  @service session;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (!this.currentUser.performsNonLearnerFunction) {
      // Slash on the route name is necessary here due to this bug:
      // https://github.com/emberjs/ember.js/issues/12945
      this.router.replaceWith('/four-oh-four');
    }
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
