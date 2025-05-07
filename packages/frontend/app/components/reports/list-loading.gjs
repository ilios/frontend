import t from 'ember-intl/helpers/t';
import repeat from 'ilios-common/helpers/repeat';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <div class="reports-list-loading" ...attributes>
    <table>
      <thead>
        <tr>
          <th>{{t "general.title"}}</th>
          <th class="text-right">{{t "general.actions"}}</th>
        </tr>
      </thead>
      <tbody>
        {{! template-lint-disable no-unused-block-params }}
        {{#each (repeat @count)}}
          <tr data-test-loading-item>
            <td class="text-left"></td>
            <td class="text-right"><FaIcon @icon="trash" class="disabled" /></td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</template>
