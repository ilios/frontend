import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import buildReportTitle from 'ilios/utils/build-report-title';
import { map } from 'rsvp';

export default class ReportsSubjectsComponent extends Component {
  @service currentUser;
  @service reporting;
  @service store;
  @service intl;

  @tracked finishedBuildingReport = false;
  @tracked editorOn = false;

  @use user = new ResolveAsyncValue(() => [this.currentUser.getModel()]);
  @use userReports = new ResolveAsyncValue(() => [this.user?.reports]);
  @use allAcademicYears = new ResolveAsyncValue(() => [this.store.findAll('academic-year')]);

  @use reports = new AsyncProcess(() => [this.reportsWithTitles.bind(this), this.userReports]);

  get reportsLoaded() {
    return !isBlank(this.reports);
  }

  async reportsWithTitles(reports) {
    return map(reports?.slice() ?? [], async (report) => {
      return {
        title: await buildReportTitle(report, this.store, this.intl),
        report,
      };
    });
  }

  @action
  deleteReport(report) {
    report.deleteRecord();
    report.save();
  }
}
