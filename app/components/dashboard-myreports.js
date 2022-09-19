import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import PapaParse from 'papaparse';
import createDownloadFile from '../utils/create-download-file';
import { later } from '@ember/runloop';
import buildReportTitle from 'ilios/utils/build-report-title';
import { map } from 'rsvp';

import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';

const SCROLL_KEY = 'dashboard-my-reports';

export default class DashboardMyreportsComponent extends Component {
  @service currentUser;
  @service preserveScroll;
  @service reporting;
  @service store;
  @service intl;

  @tracked finishedBuildingReport = false;
  @tracked myReportEditorOn = false;

  @use user = new ResolveAsyncValue(() => [this.currentUser.getModel()]);
  @use userReports = new ResolveAsyncValue(() => [this.user?.reports]);
  @use allAcademicYears = new ResolveAsyncValue(() => [this.store.findAll('academic-year')]);

  @use reports = new AsyncProcess(() => [this.reportsWithTitles.bind(this), this.userReports]);

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

  async reportsWithTitles(reports) {
    return map(reports?.slice() ?? [], async (report) => {
      return {
        title: await buildReportTitle(report, this.store, this.intl),
        report,
      };
    });
  }

  get showAcademicYearFilter() {
    if (!this.args.selectedReport) {
      return false;
    }
    const { subject, prepositionalObject } = this.args.selectedReport;
    return prepositionalObject != 'course' && ['course', 'session'].includes(subject);
  }

  deleteReport(report) {
    report.deleteRecord();
    report.save();
  }

  @action
  setScroll({ target }) {
    this.preserveScroll.savePosition(SCROLL_KEY, target.scrollTop);
  }

  @action
  scrollDown() {
    const position = this.preserveScroll.getPosition(SCROLL_KEY);
    later(() => {
      if (position && this.scrollTarget) {
        this.scrollTarget.scrollTop = position;
      }
    });
  }

  @action
  clearReport() {
    this.preserveScroll.clearPosition(SCROLL_KEY);
    this.args.onReportSelect(null);
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
