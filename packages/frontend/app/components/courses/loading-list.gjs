import t from 'ember-intl/helpers/t';
import repeat from 'ilios-common/helpers/repeat';
import random from 'ember-math-helpers/helpers/random';
import truncate from 'ilios-common/helpers/truncate';
import formatDate from 'ember-intl/helpers/format-date';
<template>
  <table
    class="ilios-table ilios-table-colors ilios-zebra-table courses-loading-list loading-shimmer loading-text"
    aria-hidden="true"
  >
    <thead>
      <tr>
        <th colspan="8">
          {{t "general.courseTitle"}}
        </th>
        <th class="hide-from-small-screen text-center" colspan="1">
          {{t "general.level"}}
        </th>
        <th class="hide-from-small-screen text-center" colspan="2">
          {{t "general.startDate"}}
        </th>
        <th class="hide-from-small-screen text-center" colspan="2">
          {{t "general.endDate"}}
        </th>
        <th class="text-right" colspan="2">
          {{t "general.status"}}
        </th>
      </tr>
    </thead>
    <tbody>
      {{#each (repeat (random 3 10))}}
        <tr class="is-loading">
          <td class="text-left" colspan="8">{{truncate
              (repeat (random 3 10) "ilios rocks")
              25
            }}</td>
          <td class="text-center hide-from-small-screen">{{random 1 9}}</td>
          <td class="text-center hide-from-small-screen">{{random 1 9}}</td>
          <td class="text-right"></td>
        </tr>
        <tr class="courses-list-item">
          <td class="text-left" colspan="8">
            {{truncate (repeat (random 3 10) "ilios rocks") 100}}
          </td>
          <td class="text-center hide-from-small-screen" colspan="1">
            {{random 1 9}}
          </td>
          <td class="text-center hide-from-small-screen" colspan="2">
            {{formatDate this.today day="2-digit" month="2-digit" year="numeric"}}
          </td>
          <td class="text-center hide-from-small-screen" colspan="2" data-test-end-date>
            {{formatDate this.today day="2-digit" month="2-digit" year="numeric"}}
          </td>
          <td class="text-right" colspan="2">
          </td>
        </tr>
      {{/each}}
    </tbody>
  </table>
</template>
