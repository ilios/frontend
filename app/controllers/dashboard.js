import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DashboardController extends Controller {
  queryParams = ['report', 'reportYear'];

  @service store;
  @use selectedReport = new AsyncProcess(() => [this.getSelectedReport.bind(this), this.report]);
  @tracked report = null;
  @tracked reportYear = null;

  async getSelectedReport(reportId) {
    if (!reportId) {
      return null;
    }
    const report = this.store.peekRecord('report', reportId);
    return report ?? this.store.findRecord('report', reportId);
  }

  @action
  setReportYear(year) {
    this.reportYear = '' === year ? null : year;
  }
}
