import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class CurriculumInventoryVerificationPreviewTable7Component extends Component {
  get totalNumSummativeAssessments() {
    return this.args.data.reduce((value, row) => {
      return value + row['num_summative_assessments'];
    }, 0);
  }

  get totalNumFormativeAssessments() {
    return this.args.data.reduce((value, row) => {
      return value + row['num_formative_assessments'];
    }, 0);
  }
  <template>
    <div
      class="curriculum-inventory-verification-preview-table"
      id="table7"
      data-test-curriculum-inventory-verification-preview-table7
      ...attributes
    >
      <h3 data-test-title id="verification-preview-table7">
        {{t "general.table7AllEventsWithAssessmentsTaggedAsFormativeOrSummative"}}
      </h3>
      <table class="ilios-table ilios-table-colors">
        <thead>
          <tr>
            <th>
              {{t "general.itemCode"}}
            </th>
            <th colspan="2">
              {{t "general.assessmentMethods"}}
            </th>
            <th>
              {{t "general.numberOfSummativeAssessments"}}
            </th>
            <th>
              {{t "general.numberOfFormativeAssessments"}}
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
                {{row.num_summative_assessments}}
              </td>
              <td>
                {{row.num_formative_assessments}}
              </td>
            </tr>
          {{else}}
            <tr>
              <td colspan="5">{{t "general.none"}}</td>
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
              {{this.totalNumSummativeAssessments}}
            </td>
            <td>
              {{this.totalNumFormativeAssessments}}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </template>
}
