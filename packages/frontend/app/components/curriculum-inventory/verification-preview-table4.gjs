import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class CurriculumInventoryVerificationPreviewTable4Component extends Component {
  get totalNumEventsPrimaryMethod() {
    return this.args.data.reduce((value, row) => {
      return value + row['num_events_primary_method'];
    }, 0);
  }

  get totalNumEventsNonPrimaryMethod() {
    return this.args.data.reduce((value, row) => {
      return value + row['num_events_non_primary_method'];
    }, 0);
  }
  <template>
    <div
      class="curriculum-inventory-verification-preview-table4"
      id="table4"
      data-test-curriculum-inventory-verification-preview-table4
      ...attributes
    >
      <h4 data-test-title>
        {{t "general.table4InstructionalMethodCounts"}}
      </h4>
      <table>
        <thead>
          <tr>
            <th>
              {{t "general.itemCode"}}
            </th>
            <th colspan="2">
              {{t "general.instructionalMethod"}}
            </th>
            <th>
              {{t "general.numberOfEventsFeaturingThisAsThePrimaryMethod"}}
            </th>
            <th>
              {{t "general.numberOfNonPrimaryOccurrencesOfThisMethod"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each @data as |row|}}
            <tr>
              <td>
                {{row.id}}
              </td>
              <td colspan="2">
                {{row.title}}
              </td>
              <td>
                {{row.num_events_primary_method}}
              </td>
              <td>
                {{row.num_events_non_primary_method}}
              </td>
            </tr>
          {{/each}}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td colspan="2">
              {{t "general.total"}}
            </td>
            <td>
              {{this.totalNumEventsPrimaryMethod}}
            </td>
            <td>
              {{this.totalNumEventsNonPrimaryMethod}}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </template>
}
