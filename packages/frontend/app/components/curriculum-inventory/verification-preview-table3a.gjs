import t from 'ember-intl/helpers/t';
<template>
  <div
    class="curriculum-inventory-verification-preview-table3a"
    id="table3a"
    data-test-curriculum-inventory-verification-preview-table3a
    ...attributes
  >
    <h3 data-test-title>
      {{t "general.table3aNonClerkshipSequenceBlockInstructionalTime"}}
    </h3>
    <table>
      <thead>
        <tr>
          <th colspan="2">
            {{t "general.nonClerkshipSequenceBlocks"}}
          </th>
          <th>
            {{t "general.phasesStartToEnd"}}
          </th>
          <th>
            {{t "general.totalWeeks"}}
          </th>
          <th>
            {{t "general.averageHoursOfInstructionPerWeek"}}
          </th>
        </tr>
      </thead>
      <tbody>
        {{#each @data as |row|}}
          <tr>
            <td colspan="2">
              {{row.title}}
            </td>
            <td>
              {{row.starting_level}}
              -
              {{row.ending_level}}
            </td>
            <td>
              {{row.weeks}}
            </td>
            <td>
              {{row.avg}}
            </td>
          </tr>
        {{else}}
          <tr>
            <td colspan="5">{{t "general.none"}}</td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</template>
