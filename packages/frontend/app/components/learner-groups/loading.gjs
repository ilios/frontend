import t from 'ember-intl/helpers/t';
import repeat from 'ilios-common/helpers/repeat';
import truncate from 'ilios-common/helpers/truncate';
import random from 'ember-math-helpers/helpers/random';
<template>
  <table class="learner-groups-loading" ...attributes>
    <thead>
      <tr>
        <th class="text-left" colspan="2">
          {{t "general.learnerGroupTitle"}}
        </th>
        <th class="text-center hide-from-small-screen">
          {{t "general.members"}}
        </th>
        <th class="text-center hide-from-small-screen">
          {{t "general.subgroups"}}
        </th>
        <th class="text-right">
          {{t "general.actions"}}
        </th>
      </tr>
    </thead>
    <tbody>
      {{! template-lint-disable no-unused-block-params }}
      {{#each (repeat @count) as |empty|}}
        <tr class="is-loading">
          <td class="text-left" colspan="2">{{truncate
              (repeat (random 3 10) "ilios rocks")
              100
            }}</td>
          <td class="text-center hide-from-small-screen">{{random 1 9}}</td>
          <td class="text-center hide-from-small-screen">{{random 1 9}}</td>
          <td class="text-right"></td>
        </tr>
      {{/each}}
    </tbody>
  </table>
</template>
