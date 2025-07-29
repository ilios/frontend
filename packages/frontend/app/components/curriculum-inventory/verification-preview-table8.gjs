import t from 'ember-intl/helpers/t';
<template>
  <div
    class="curriculum-inventory-verification-preview-table8"
    id="table8"
    data-test-curriculum-inventory-verification-preview-table8
    ...attributes
  >
    <h3 data-test-title id="verification-preview-table8">
      {{t "general.table8AllResourceTypes"}}
    </h3>
    <table>
      <thead>
        <tr>
          <th>
            {{t "general.itemCode"}}
          </th>
          <th colspan="2">
            {{t "general.resourceTypes"}}
          </th>
          <th>
            {{t "general.numberOfEvents"}}
          </th>
        </tr>
      </thead>
      <tbody>
        {{#if @data.length}}
          {{#each @data as |row|}}
            <tr>
              <td>
                {{row.id}}
              </td>
              <td colspan="2">
                {{row.title}}
              </td>
              <td>
                {{row.count}}
              </td>
            </tr>
          {{/each}}
        {{else}}
          <tr>
            <td colspan="4">{{t "general.none"}}</td>
          </tr>
        {{/if}}
      </tbody>
    </table>
  </div>
</template>
