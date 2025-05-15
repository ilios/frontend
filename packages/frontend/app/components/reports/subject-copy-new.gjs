import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';

export default class ReportsSubjectCopyNew extends Component {
  @service reporting;
  @service intl;

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

  get linkQuery() {
    const query = {
      selectedSchoolId: this.args.school.id,
      selectedSubject: this.args.subject,
      selectedPrepositionalObject: this.args.prepositionalObject,
      selectedPrepositionalObjectId: this.args.prepositionalObjectTableRowId,
      showNewReportForm: true,
    };

    if (this.args.report?.title) {
      query.title = `${this.args.report.title} (${this.intl.t('general.copy')})`;
    }

    return query;
  }
  <template>
    {{#if this.reportTitleData.isResolved}}
      <div class="copy-new" data-test-subject-report-copy-new>
        <LinkTo @route="reports.subjects" @query={{this.linkQuery}} class="button" data-test-button>
          <FaIcon @icon="copy" />
          {{t "general.copyReport"}}
        </LinkTo>
      </div>
    {{/if}}
  </template>
}
