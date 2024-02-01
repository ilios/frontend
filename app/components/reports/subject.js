import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import PapaParse from 'papaparse';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'frontend/utils/create-download-file';
import { validatable, Length } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

@validatable
export default class ReportsSubjectComponent extends Component {
  @service currentUser;
  @service preserveScroll;
  @service reporting;
  @service store;
  @tracked finishedBuildingReport = false;
  @tracked myReportEditorOn = false;
  @tracked @Length(1, 240) title = '';

  @cached
  get reportTitleData() {
    return new TrackedAsyncData(
      this.reporting.buildReportTitle(
        this.args.report.subject,
        this.args.report.prepositionalObject,
        this.args.report.prepositionalObjectTableRowId,
        this.school,
      ),
    );
  }

  get reportDescriptionPromise() {
    return this.reporting.buildReportDescription(
      this.args.report.subject,
      this.args.report.prepositionalObject,
      this.args.report.prepositionalObjectTableRowId,
      this.school,
    );
  }

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

  get reportTitle() {
    if (this.args.report.title) {
      return this.args.report.title;
    }

    return this.reportTitleData.isResolved ? this.reportTitleData.value : null;
  }

  get school() {
    if (this.args.report.school) {
      const schoolId = this.args.report.belongsTo('school').id();

      return this.schoolsById[schoolId];
    }

    return null;
  }

  @dropTask
  *changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.report.title = this.title;
    yield this.args.report.save();
  }

  @action
  revertTitleChanges() {
    this.title = this.reportTitle;
  }

  @dropTask
  *downloadReport() {
    const report = this.args.report;
    const title = this.reportTitle;
    const year = this.args.selectedYear;
    const data = yield this.reporting.getArrayResults(report, year);
    this.finishedBuildingReport = true;
    const csv = PapaParse.unparse(data);
    createDownloadFile(`${title}.csv`, csv, 'text/csv');
    yield timeout(2000);
    this.finishedBuildingReport = false;
  }
}
