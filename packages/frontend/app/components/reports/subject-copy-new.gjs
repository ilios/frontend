import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';

export default class ReportsSubjectCopyNew extends Component {
  @service reporting;

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
  <template>
    {{#if this.reportTitleData.isResolved}}
      <div class="copy-new" data-test-subject-report-copy-new>
        <LinkTo
          @route="reports.subjects"
          @query={{hash
            showNewReportForm=true
            title=this.reportTitle
            selectedSchoolId=@school.id
            selectedSubject=@subject
            selectedPrepositionalObject=@prepositionalObject
            selectedPrepositionalObjectId=@prepositionalObjectTableRowId
          }}
          class="button"
          data-test-button
        >
          <FaIcon @icon="pencil" />
          {{t "general.edit"}}
        </LinkTo>
      </div>
    {{/if}}
  </template>
}
