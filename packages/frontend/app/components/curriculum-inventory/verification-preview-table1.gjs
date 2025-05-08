<div
  class="curriculum-inventory-verification-preview-table1"
  id="table1"
  data-test-curriculum-inventory-verification-preview-table1
  ...attributes
>
  <h4 data-test-title>
    {{t "general.table1ProgramExpectationsMappedToPcrs"}}
  </h4>
  <table>
    <thead>
      <tr>
        <th>
          {{t "general.programExpectationsId"}}
        </th>
        <th colspan="3">
          {{t "general.programExpectations"}}
        </th>
        <th colspan="2">
          {{t "general.physicianCompetencyReferenceSet"}}
          ({{t "general.physicianCompetencyReferenceSetAbbr"}})
        </th>
      </tr>
    </thead>
    <tbody>
      {{#each @data as |row|}}
        <tr>
          <td>
            {{t "general.notApplicableAbbr"}}
          </td>
          <td colspan="3">
            {{! template-lint-disable no-triple-curlies}}
            {{{row.title}}}
          </td>
          <td colspan="2">
            <ul>
              {{#each row.pcrs as |pcrs|}}
                <li>
                  {{pcrs}}
                </li>
              {{/each}}
            </ul>
          </td>
        </tr>
      {{/each}}
    </tbody>
  </table>
</div>