import t from 'ember-intl/helpers/t';
<template>
  <div
    class="curriculum-inventory-verification-preview-table"
    id="table3b"
    data-test-curriculum-inventory-verification-preview-table3b
    ...attributes
  >
    <h3 data-test-title>
      {{t "general.table3bClerkshipSequenceBlockInstructionalTime"}}
    </h3>
    <table class="ilios-table">
      <thead>
        <tr>
          <th colspan="2">
            {{t "general.clerkshipSequenceBlocks"}}
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
