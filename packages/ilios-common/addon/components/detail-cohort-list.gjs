<div class="detail-cohort-list">
  {{#if this.cohortsData.isResolved}}
    {{#if this.sortedCohorts.length}}
      <table>
        <thead>
          <tr>
            <th class="text-left">
              {{t "general.school"}}
            </th>
            <th class="text-left">
              {{t "general.program"}}
            </th>
            <th class="text-left">
              {{t "general.cohort"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each this.sortedCohorts as |cohort|}}
            <tr>
              <td class="text-left">
                {{cohort.programYear.program.school.title}}
              </td>
              <td class="text-left">
                {{cohort.programYear.program.title}}
              </td>
              <td class="text-left">
                {{#if cohort.title}}
                  {{cohort.title}}
                {{else}}
                  {{t "general.classOf" year=cohort.programYear.classOfYear}}
                {{/if}}
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    {{else}}
      {{t "general.noCohorts"}}
    {{/if}}
  {{else}}
    <LoadingSpinner />
  {{/if}}
</div>