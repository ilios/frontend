import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import PapaParse from 'papaparse';
import { TrackedAsyncData } from 'ember-async-data';

export default class ReportsSubjectDownload extends Component {
  @service reporting;
  @tracked finishedBuildingReport = false;

  @cached
  get reportTitleData() {
    return new TrackedAsyncData(
      this.reporting.buildReportTitle(
        this.args.subject,
        this.args.prepositionalObject,
        this.args.prepositionalObjectTableRowId,
        this.args.school,
      ),
    );
  }

  get reportTitle() {
    if (this.args.report?.title) {
      return this.args.report.title;
    }

    return this.reportTitleData.isResolved ? this.reportTitleData.value : null;
  }

  downloadReport = dropTask(async () => {
    const data = await this.args.fetchDownloadData();
    const csv = PapaParse.unparse(data);
    this.finishedBuildingReport = true;
    createDownloadFile(`${this.reportTitle}.csv`, csv, 'text/csv');
    await timeout(2000);
    this.finishedBuildingReport = false;
  });
}
