import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import PapaParse from 'papaparse';
import { TrackedAsyncData } from 'ember-async-data';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';

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
  <template>
    {{#if this.reportTitleData.isResolved}}
      <div class="download" data-test-subject-report-download>
        {{#if @message}}
          <p data-test-message>{{@message}}</p>
        {{/if}}
        <button
          type="button"
          disabled={{not @readyToDownload}}
          {{on "click" (perform this.downloadReport)}}
          data-test-button
        >
          {{#if this.finishedBuildingReport}}
            <FaIcon @icon="check" />
          {{else}}
            <FaIcon @icon="download" />
          {{/if}}
          {{t "general.downloadResults"}}
        </button>
      </div>
    {{/if}}
  </template>
}
