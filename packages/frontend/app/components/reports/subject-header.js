import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import PapaParse from 'papaparse';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'frontend/utils/create-download-file';
import { validatable, Length } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class ReportsSubjectHeader extends Component {
  @service reporting;
  @tracked @Length(1, 240) title = '';

  @cached
  get reportTitleData() {
    return new TrackedAsyncData(
      this.reporting.buildReportTitle(
        this.args.report.subject,
        this.args.report.prepositionalObject,
        this.args.report.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get reportTitle() {
    if (this.args.report.title) {
      return this.args.report.title;
    }

    return this.reportTitleData.isResolved ? this.reportTitleData.value : null;
  }

  changeTitle = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.report.title = this.title;
    await this.args.report.save();
  });

  @action
  revertTitleChanges() {
    this.title = this.reportTitle;
  }

  downloadReport = dropTask(async () => {
    const { report, year } = this.args;
    const title = this.reportTitle;
    const data = await this.reporting.getArrayResults(report, year);
    this.finishedBuildingReport = true;
    const csv = PapaParse.unparse(data);
    createDownloadFile(`${title}.csv`, csv, 'text/csv');
    await timeout(2000);
    this.finishedBuildingReport = false;
  });
}
