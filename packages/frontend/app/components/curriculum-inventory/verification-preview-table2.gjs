import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';

export default class CurriculumInventoryVerificationPreviewTable2Component extends Component {
  get methodTotals() {
    return this.args.data.methods.map((method) => {
      return (method.total / 60).toFixed(2);
    });
  }

  get nonClerkships() {
    const methods = this.args.data.methods;
    return this.args.data.rows.map((row) => {
      return {
        title: row.title,
        methods: methods.map((method) => {
          const minutes = row.instructional_methods[method.title];
          if (minutes) {
            return (minutes / 60).toFixed(2);
          }
          return '';
        }),
        total: (row.total / 60).toFixed(2),
        startingLevel: row.starting_level,
        endingLevel: row.ending_level,
      };
    });
  }

  get sumTotal() {
    const sumTotal = this.args.data.methods.reduce((value, method) => {
      return value + method.total;
    }, 0);
    return (sumTotal / 60).toFixed(2);
  }
  <template>
    <div
      class="curriculum-inventory-verification-preview-table2"
      id="table2"
      data-test-curriculum-inventory-verification-preview-table2
      ...attributes
    >
      <h3 data-test-title>
        {{t "general.table2PrimaryInstructionalMethodByNonClerkshipSequenceBlock"}}
      </h3>
      <table>
        <thead>
          <tr>
            <th colspan="2" rowspan="2">
              {{t "general.nonClerkshipSequenceBlocks"}}
            </th>
            <th rowspan="2">
              {{t "general.phasesStartToEnd"}}
            </th>
            <th colspan={{add 1 @data.methods.length}}>
              {{t "general.numberOfFormalInstructionalHoursPerCourse"}}
            </th>
          </tr>
          <tr>
            {{#each @data.methods as |method|}}
              <th>
                {{method.title}}
              </th>
            {{/each}}
            <th>
              {{t "general.total"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#if this.nonClerkships.length}}
            {{#each this.nonClerkships as |clerkship|}}
              <tr>
                <td colspan="2">
                  {{clerkship.title}}
                </td>
                <td>
                  {{clerkship.startingLevel}}
                  -
                  {{clerkship.endingLevel}}
                </td>
                {{#each clerkship.methods as |method|}}
                  <td>
                    {{method}}
                  </td>
                {{/each}}
                <td>
                  {{clerkship.total}}
                </td>
              </tr>
            {{/each}}
          {{else}}
            <tr>
              <td colspan="4">{{t "general.none"}}</td>
            </tr>
          {{/if}}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">
              {{t "general.total"}}
            </td>
            <td></td>
            {{#each this.methodTotals as |total|}}
              <td>
                {{total}}
              </td>
            {{/each}}
            <td>
              {{this.sumTotal}}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </template>
}
