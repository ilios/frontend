import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { tracked } from '@glimmer/tracking';

export default class ReportsController extends Controller {
  @service store;

  @use selectedReport = new AsyncProcess(() => [this.getSelectedReport.bind(this), this.report]);

  queryParams = ['report', 'reportYear'];

  @tracked report = null;
  @tracked reportYear = '';

  async getSelectedReport(reportId) {
    if (!reportId) {
      return null;
    }
    const report = this.store.peekRecord('report', reportId);
    return report ?? this.store.findRecord('report', reportId);
  }
}
