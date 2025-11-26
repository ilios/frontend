import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import SchoolSessionTypesListItem from 'frontend/components/school-session-types-list-item';
<template>
  <div class="school-session-types-list" data-test-school-session-types-list ...attributes>
    <table class="ilios-table ilios-table-colors ilios-removable-table">
      <thead>
        <tr>
          <th colspan="3">
            {{t "general.title"}}
          </th>
          <th class="hide-from-small-screen">
            {{t "general.sessions"}}
          </th>
          <th>
            {{t "general.assessment"}}
          </th>
          <th class="hide-from-small-screen" colspan="2">
            {{t "general.assessmentOption"}}
          </th>
          <th class="hide-from-small-screen" colspan="2">
            {{t "general.aamcMethod"}}
          </th>
          <th class="hide-from-small-screen">
            {{t "general.color"}}
          </th>
          <th>
            {{t "general.actions"}}
          </th>
        </tr>
      </thead>
      <tbody>
        {{#each (sortBy "active:desc" "title" @sessionTypes) as |sessionType|}}
          <SchoolSessionTypesListItem
            @sessionType={{sessionType}}
            @canDelete={{@canDelete}}
            @manageSessionType={{@manageSessionType}}
          />
        {{/each}}
      </tbody>
    </table>
  </div>
</template>
