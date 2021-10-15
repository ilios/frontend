/* eslint-disable ember/no-computed-properties-in-native-classes */
import CommonDashboardController from 'ilios-common/controllers/dashboard';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { tracked } from '@glimmer/tracking';

export default class DashboardController extends CommonDashboardController {
  @service store;

  @use selectedReport = new AsyncProcess(() => [this.getSelectedReport.bind(this), this.report]);

  //most params come from common controller, but are copied here
  queryParams = [
    'academicYear',
    'cohorts',
    'courseFilters',
    'courseLevels',
    'courses',
    'date',
    'mySchedule',
    'school',
    'sessionTypes',
    'show',
    'showFilters',
    'terms',
    'view',
    'report',
    'reportYear',
  ];

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
