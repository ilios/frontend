import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import AsyncProcess from 'ilios-common/classes/async-process';
import { map } from 'rsvp';

export default class ReportsSubjectsComponent extends Component {
  @service currentUser;
  @service reporting;
  @service store;

  @tracked finishedBuildingReport = false;
  @tracked editorOn = false;

  @cached
  get userData() {
    return new TrackedAsyncData(this.currentUser.getModel());
  }

  get user() {
    return this.userData.isResolved ? this.userData.value : null;
  }

  @cached
  get userReportsData() {
    return new TrackedAsyncData(this.user?.reports);
  }

  get userReports() {
    return this.userReportsData.isResolved ? this.userReportsData.value : null;
  }

  @cached
  get allAcademicYearsData() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  get allAcademicYears() {
    return this.allAcademicYearsData.isResolved ? this.allAcademicYearsData.value : null;
  }

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
      const title = report.title || (await this.reporting.buildReportTitle(report));
      return {
        title,
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
