import t from 'ember-intl/helpers/t';
<template>
  <div
    class="curriculum-inventory-verification-preview-table1"
    id="table1"
    data-test-curriculum-inventory-verification-preview-table1
    ...attributes
  >
    <h3 data-test-title>
      {{t "general.table1ProgramExpectationsMappedToPcrs"}}
    </h3>
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
        {{#if @data.length}}
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
        {{else}}
          <tr>
            <td colspan="6">{{t "general.none"}}</td>
          </tr>
        {{/if}}
      </tbody>
    </table>
  </div>
</template>
