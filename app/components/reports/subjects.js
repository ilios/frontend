import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';
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
  @use titledReports = new AsyncProcess(() => [
    this.reportsWithTitles.bind(this),
    this.userReports,
  ]);

  get reportsLoaded() {
    return !isNone(this.titledReports);
  }

  get reports() {
    if (isNone(this.titledReports)) {
      return [];
    }
    return this.titledReports;
  }

  async reportsWithTitles(reports) {
    if (isNone(reports)) {
      return null;
    }
    return map(reports.slice(), async (report) => {
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

  @dropTask
  *saveNewReport(report) {
    yield report.save();
  }
}
