import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';

export default class CurriculumInventoryVerificationPreviewTable5Component extends Component {
  get nonClerkships() {
    const methods = this.args.data.methods;
    return this.args.data.rows.map((row) => {
      return {
        hasFormativeAssessments: row.has_formative_assessments ? 'Y' : '',
        hasNarrativeAssessments: row.has_narrative_assessments ? 'Y' : '',
        methods: methods.map((method) => {
          return row.methods[method] ? 'X' : '';
        }),
        numExams: row.num_exams,
        title: row.title,
        startingLevel: row.starting_level,
        endingLevel: row.ending_level,
      };
    });
  }
  <template>
    <div
      class="curriculum-inventory-verification-preview-table5"
      id="table5"
      data-test-curriculum-inventory-verification-preview-table5
      ...attributes
    >
      <h4 data-test-title id="verification-preview-table5">
        {{t "general.table5NonClerkshipSequenceBlockAssessmentMethods"}}
      </h4>
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
              {{t "general.includedInGrade"}}
            </th>
            <th colspan="2">
              {{t "general.assessments"}}
            </th>
          </tr>
          <tr>
            <th>
              {{t "general.numberOfExams"}}
            </th>
            {{#each @data.methods as |method|}}
              <th>
                {{method}}
              </th>
            {{/each}}
            <th>
              {{t "general.formative"}}
            </th>
            <th>
              {{t "general.narrative"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#if this.nonClerkships.length}}
            {{#each this.nonClerkships as |nonClerkship|}}
              <tr>
                <td colspan="2">
                  {{nonClerkship.title}}
                </td>
                <td>
                  {{nonClerkship.startingLevel}}
                  -
                  {{nonClerkship.endingLevel}}
                </td>
                <td>
                  {{nonClerkship.numExams}}
                </td>
                {{#each nonClerkship.methods as |method|}}
                  <td>
                    {{method}}
                  </td>
                {{/each}}
                <td>
                  {{nonClerkship.hasFormativeAssessments}}
                </td>
                <td>
                  {{nonClerkship.hasNarrativeAssessments}}
                </td>
              </tr>
            {{/each}}
          {{else}}
            <tr>
              <td colspan="13">{{t "general.none"}}</td>
            </tr>
          {{/if}}
        </tbody>
      </table>
    </div>
  </template>
}
