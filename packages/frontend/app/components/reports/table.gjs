import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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
}

<table data-test-reports-table ...attributes>
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
    {{#each (sort-by @sortBy @decoratedReports) as |decoratedReport|}}
      <Reports::TableRow
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