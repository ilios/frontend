import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import PapaParse from 'papaparse';

export default class ReportsSubjectDownload extends Component {
  @service reporting;
  @tracked finishedBuildingReport = false;

  downloadReport = dropTask(async () => {
    const data = await this.args.fetchDownloadData();
    const csv = PapaParse.unparse(data);
    this.finishedBuildingReport = true;
    createDownloadFile(`${this.args.reportTitle}.csv`, csv, 'text/csv');
    await timeout(2000);
    this.finishedBuildingReport = false;
  });
}
