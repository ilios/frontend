import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import SortableTh from 'ilios-common/components/sortable-th';
import or from 'ember-truth-helpers/helpers/or';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import TableRow from 'frontend/components/reports/table-row';
import includes from 'ilios-common/helpers/includes';
import { on } from '@ember/modifier';

export default class ReportsListComponent extends Component {
  @tracked reportsForRemovalConfirmation = [];

  get sortedAscending() {
    return !this.args.sortBy.includes(':desc');
  }

  @action
  confirmRemoval(report) {
    this.reportsForRemovalConfirmation = [...this.reportsForRemovalConfirmation, report.id];
  }

  @action
  cancelRemove(report) {
    this.reportsForRemovalConfirmation = this.reportsForRemovalConfirmation.filter(
      (id) => id !== report.id,
    );
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }
  <template>
    <table
      class="ilios-table ilios-table-colors ilios-zebra-table"
      data-test-reports-table
      ...attributes
    >
      <thead>
        <tr data-test-report-headings>
          <SortableTh
            data-test-report-title-heading
            @sortedAscending={{this.sortedAscending}}
            @sortedBy={{or (eq @sortBy "title") (eq @sortBy "title:desc")}}
            @colspan="11"
            @onClick={{fn this.setSortBy "title"}}
          >
            {{t "general.title"}}
          </SortableTh>
          <th class="text-right" colspan="1">{{t "general.actions"}}</th>
        </tr>
      </thead>
      <tbody data-test-reports>
        {{#each (sortBy @sortBy @decoratedReports) as |decoratedReport|}}
          <TableRow
            @decoratedReport={{decoratedReport}}
            @reportsForRemovalConfirmation={{this.reportsForRemovalConfirmation}}
            @confirmRemoval={{this.confirmRemoval}}
          />
          {{#if (includes decoratedReport.report.id this.reportsForRemovalConfirmation)}}
            <tr class="confirm-removal">
              <td colspan="12">
                <div class="confirm-message">
                  {{t "general.reportConfirmRemove"}}
                  <br />
                  <div class="confirm-buttons">
                    <button
                      {{on "click" (fn @remove decoratedReport.report)}}
                      type="button"
                      class="remove text"
                    >
                      {{t "general.yes"}}
                    </button>
                    <button
                      type="button"
                      class="done text"
                      {{on "click" (fn this.cancelRemove decoratedReport.report)}}
                    >
                      {{t "general.cancel"}}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          {{/if}}
        {{/each}}
      </tbody>
    </table>
  </template>
}
