import t from 'ember-intl/helpers/t';
import ListItem from 'frontend/components/programs/list-item';
<template>
  <div class="list" ...attributes data-test-program-list>
    {{#if @programs.length}}
      <table class="ilios-zebra-table">
        <thead>
          <tr>
            <th class="text-left" colspan="3">
              {{t "general.programTitle"}}
            </th>
            <th class="text-center hide-from-small-screen" colspan="2">
              {{t "general.school"}}
            </th>
            <th class="text-right" colspan="2">
              {{t "general.actions"}}
            </th>
          </tr>
        </thead>
        <tbody>
          {{#each @programs as |program|}}
            <ListItem @program={{program}} />
          {{/each}}
        </tbody>
      </table>
    {{/if}}
  </div>
</template>
