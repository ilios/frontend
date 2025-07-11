import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import FilterCheckbox from 'ilios-common/components/dashboard/filter-checkbox';
import includes from 'ilios-common/helpers/includes';
import { fn } from '@ember/helper';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
<template>
  <div
    class="calendar-filter-list large-filter-list dashboard-cohort-calendar-filter"
    data-test-cohort-calendar-filter
  >
    <h2>{{t "general.programAndCohort"}}</h2>
    <ul class="cohorts filters">
      {{#each (sortBy "classOfYear:desc" @cohortProxies) as |obj|}}
        <li data-test-cohort>
          <FilterCheckbox
            @checked={{includes obj.id @selectedIds}}
            @add={{fn @add obj.id}}
            @remove={{fn @remove obj.id}}
            @targetId={{obj.id}}
          >
            {{obj.displayTitle}}
            {{obj.programTitle}}
          </FilterCheckbox>
        </li>
      {{else}}
        <li><LoadingSpinner /></li>
      {{/each}}
    </ul>
  </div>
</template>
