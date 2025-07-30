import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class CurriculumInventoryVerificationPreviewTable6Component extends Component {
  get clerkships() {
    const methods = this.args.data.methods;
    return this.args.data.rows.map((row) => {
      return {
        hasFormativeAssessments: row.has_formative_assessments ? 'Y' : '',
        hasNarrativeAssessments: row.has_narrative_assessments ? 'Y' : '',
        methods: methods.map((method) => {
          return row.methods[method] ? 'X' : '';
        }),
        title: row.title,
        startingLevel: row.starting_level,
        endingLevel: row.ending_level,
      };
    });
  }
  <template>
    <div
      class="curriculum-inventory-verification-preview-table6"
      id="table6"
      data-test-curriculum-inventory-verification-preview-table6
      ...attributes
    >
      <h3 data-test-title id="verification-preview-table6">
        {{t "general.table6ClerkshipSequenceBlockAssessmentMethods"}}
      </h3>
      <table>
        <thead>
          <tr>
            <th colspan="2" rowspan="2">
              {{t "general.clerkshipSequenceBlocks"}}
            </th>
            <th rowspan="2">
              {{t "general.phasesStartToEnd"}}
            </th>
            <th colspan={{@data.methods.length}}>
              {{t "general.includedInGrade"}}
            </th>
            <th colspan="2">
              {{t "general.assessments"}}
            </th>
          </tr>
          <tr>
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
          {{#each this.clerkships as |clerkship|}}
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
                {{clerkship.hasFormativeAssessments}}
              </td>
              <td>
                {{clerkship.hasNarrativeAssessments}}
              </td>
            </tr>
          {{else}}
            <tr>
              <td colspan="11">{{t "general.none"}}</td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </template>
}
