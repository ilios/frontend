import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';

export default class ReportsSubjectsListComponent extends Component {
  @service store;
  @service currentUser;
  @service reporting;

  @tracked newSubjectReport;
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

          const title = report.title
            ? report.title
            : await this.reporting.buildReportTitle(
                report.subject,
                report.prepositionalObject,
                report.prepositionalObjectTableRowId,
                school,
              );

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
    return this.subjectReportObjects?.isResolved ? this.subjectReportObjects.value : [];
  }

  get newReport() {
    if (this.newSubjectReport) {
      return this.decoratedReports.find(({ report }) => report === this.newSubjectReport);
    }

    return false;
  }

  get filteredReports() {
    const filterTitle = this.args.titleFilter?.trim().toLowerCase() ?? '';
    return this.decoratedReports.filter(({ title }) =>
      title.trim().toLowerCase().includes(filterTitle),
    );
  }

  saveNewSubjectReport = dropTask(async (report) => {
    this.args.setRunningSubjectReport(null);
    this.newSubjectReport = await report.save();
    this.showNewReportForm = false;
  });

  removeReport = dropTask(async (report) => {
    await report.destroyRecord();
    this.newSubjectReport = null;
  });

  runSubjectReport = restartableTask(
    async (subject, prepositionalObject, prepositionalObjectTableRowId, school) => {
      this.reportYear = null;
      this.args.setRunningSubjectReport({
        subject,
        prepositionalObject,
        prepositionalObjectTableRowId,
        school,
        description: await this.reporting.buildReportDescription(
          subject,
          prepositionalObject,
          prepositionalObjectTableRowId,
          school,
        ),
      });
    },
  );

  @action
  createNewReport(type) {
    this.args.setRunningSubjectReport(null);
    this.args[`setShowNew${type}ReportForm`](true);
  }
}
