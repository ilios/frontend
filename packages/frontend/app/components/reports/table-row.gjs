import Component from '@glimmer/component';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default class ReportsListRowComponent extends Component {
  get showRemoveConfirmation() {
    return this.args.reportsForRemovalConfirmation.includes(this.args.decoratedReport.report.id);
  }

  get isSubjectReport() {
    return this.args.decoratedReport.type === 'subject';
  }
  <template>
    <tr
      class="reports-table-row{{if this.showRemoveConfirmation ' confirm-removal'}}"
      data-test-reports-table-row
    >
      <td class="text-left" colspan="11" data-test-report-title>
        {{#if this.isSubjectReport}}
          <LinkTo @route="reports.subject" @model={{@decoratedReport.report}}>
            {{@decoratedReport.title}}
          </LinkTo>
        {{/if}}
      </td>
      <td class="text-right" colspan="1" data-test-status>
        <button
          type="button"
          class="link-button"
          title={{t "general.delete"}}
          {{on "click" (fn @confirmRemoval @decoratedReport.report)}}
          data-test-remove
        >
          <FaIcon @icon={{faTrash}} class="enabled remove" />
        </button>
      </td>
    </tr>
  </template>
}
