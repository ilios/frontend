import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import PapaParse from 'papaparse';
import { use } from 'ember-could-get-used-to-this';
import buildReportTitle from 'ilios/utils/build-report-title';
import createDownloadFile from 'ilios/utils/create-download-file';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class ReportsSubjectComponent extends Component {
  @service currentUser;
  @service preserveScroll;
  @service reporting;
  @service store;
  @service intl;

  @tracked finishedBuildingReport = false;
  @tracked myReportEditorOn = false;

  @use allAcademicYears = new ResolveAsyncValue(() => [this.store.findAll('academic-year')]);

  @use selectedReportTitle = new AsyncProcess(() => [
    this.getSelectedReportTitle.bind(this),
    this.args.selectedReport,
  ]);

  @use reportResultsList = new AsyncProcess(() => [
    this.getReportResults.bind(this),
    this.args.selectedReport,
    this.args.selectedYear,
  ]);

  async getSelectedReportTitle(selectedReport) {
    if (!selectedReport) {
      return '';
    }
    return buildReportTitle(selectedReport, this.store, this.intl);
  }

  async getReportResults(selectedReport, selectedYear) {
    if (!selectedReport) {
      return [];
    }
    return this.reporting.getResults(selectedReport, selectedYear);
  }

  get showAcademicYearFilter() {
    if (!this.args.selectedReport) {
      return false;
    }
    const { subject, prepositionalObject } = this.args.selectedReport;
    return prepositionalObject !== 'course' && ['course', 'session'].includes(subject);
  }

  @dropTask
  *downloadReport() {
    const report = this.args.selectedReport;
    const title = this.selectedReportTitle;
    const year = this.args.selectedYear;
    const data = yield this.reporting.getArrayResults(report, year);
    this.finishedBuildingReport = true;
    const csv = PapaParse.unparse(data);
    createDownloadFile(`${title}.csv`, csv, 'text/csv');
    yield timeout(2000);
    this.finishedBuildingReport = false;
  }
}
