import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ReportsListComponent extends Component {
  @service store;
  @service currentUser;
  @service reporting;

  @tracked showNewReportForm;
  @tracked newSubjectReport;
  @tracked runningSubjectReport;
  @tracked reportYear;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get allSchools() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  get schoolsById() {
    if (!this.allSchools.isResolved) {
      return null;
    }

    const rhett = {};
    this.allSchools.value.forEach((school) => {
      rhett[school.id] = school;
    });

    return rhett;
  }

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
    if (
      !this.subjectReports.isResolved ||
      !this.subjectReports.value ||
      !this.allSchools.isResolved
    ) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(
        this.subjectReports.value.map(async (report) => {
          let school;
          if (report.school) {
            const schoolId = report.belongsTo('school').id();

            school = this.schoolsById[schoolId];
          }

          const title =
            report.title ??
            (await this.reporting.buildReportTitle(
              report.subject,
              report.prepositionalObject,
              report.prepositionalObjectTableRowId,
              school,
            ));

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
    this.runningSubjectReport = null;
    this.newSubjectReport = yield report.save();
    this.showNewReportForm = false;
  }

  @dropTask
  *removeReport(report) {
    yield report.destroyRecord();
    this.newSubjectReport = null;
  }

  @restartableTask
  *runSubjectReport(subject, prepositionalObject, prepositionalObjectTableRowId, school) {
    this.runningSubjectReport = {
      subject,
      prepositionalObject,
      prepositionalObjectTableRowId,
      school,
      description: yield this.reporting.buildReportDescription(
        subject,
        prepositionalObject,
        prepositionalObjectTableRowId,
        school,
      ),
    };
  }

  @action
  toggleNewReportForm() {
    this.runningSubjectReport = null;
    this.showNewReportForm = !this.showNewReportForm;
  }
}
