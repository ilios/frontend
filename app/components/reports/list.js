import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class ReportsListComponent extends Component {
  @service store;
  @service currentUser;
  @service reporting;

  @tracked showNewReportForm;
  @tracked newSubjectReport;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get subjectReports() {
    return new TrackedAsyncData(this.userModel.isResolved ? this.user.reports : null);
  }

  @cached
  get subjectReportObjects() {
    if (!this.subjectReports.isResolved || !this.subjectReports.value) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(
        this.subjectReports.value.map(async (report) => {
          const title = report.title ?? (await this.reporting.buildReportTitle(report));

          return {
            report,
            title,
            type: 'subject',
          };
        }),
      ),
    );
  }

  get reportsCount() {
    return this.user?.hasMany('reports').ids().length ?? 0;
  }

  get decoratedReports() {
    if (!this.subjectReportObjects?.isResolved) {
      return [];
    }

    return this.subjectReportObjects.value;
  }

  get newReport() {
    if (this.newSubjectReport) {
      return this.decoratedReports.find(({ report }) => report === this.newSubjectReport);
    }

    return false;
  }

  get subjectReportsFilteredByTitle() {
    const filterTitle = this.args.titleFilter?.trim().toLowerCase() ?? '';
    return this.decoratedReports.filter(({ title }) =>
      title.trim().toLowerCase().includes(filterTitle),
    );
  }

  get filteredReports() {
    return this.subjectReportsFilteredByTitle;
  }

  @dropTask
  *saveNewSubjectReport(report) {
    this.newSubjectReport = yield report.save();
    this.showNewReportForm = false;
  }

  @dropTask
  *removeReport(report) {
    yield report.destroyRecord();
    this.newSubjectReport = null;
  }
}
