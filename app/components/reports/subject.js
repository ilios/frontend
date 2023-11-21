import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isNone } from '@ember/utils';
import PapaParse from 'papaparse';
import { dropTask, timeout } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import createDownloadFile from 'ilios/utils/create-download-file';
import AsyncProcess from 'ilios-common/classes/async-process';
import { validatable, Length } from 'ilios-common/decorators/validation';

@validatable
export default class ReportsSubjectComponent extends Component {
  @service currentUser;
  @service preserveScroll;
  @service reporting;
  @service store;
  @tracked finishedBuildingReport = false;
  @tracked myReportEditorOn = false;
  @tracked @Length(1, 240) title = '';

  @use constructedReportTitle = new AsyncProcess(() => [
    this.constructReportTitle.bind(this),
    this.args.report,
  ]);

  get constructedReportTitleLoaded() {
    return !isNone(this.constructedReportTitle);
  }

  get reportTitle() {
    if (this.args.report.title) {
      return this.args.report.title;
    }

    if (isNone(this.constructedReportTitle)) {
      return '';
    }
    return this.constructedReportTitle;
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

  async constructReportTitle(report) {
    return this.reporting.buildReportTitle(report);
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
