import sortByPosition from 'ilios-common/helpers/sort-by-position';
import ManageObjectiveParentsItem from 'ilios-common/components/session/manage-objective-parents-item';
import includes from 'ilios-common/helpers/includes';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
<template>
  <section class="session-manage-objective-parents" data-test-session-manage-objective-parents>
    {{#if @courseObjectives.length}}
      <h4 data-test-course-title>{{@courseTitle}}</h4>
      <ul class="parent-picker" data-test-parent-picker>
        {{#each (sortByPosition @courseObjectives) as |objective|}}
          <li>
            <ManageObjectiveParentsItem
              @title={{objective.title}}
              @isSelected={{includes objective @selected}}
              @add={{fn @add objective}}
              @remove={{fn @remove objective}}
            />
          </li>
        {{/each}}
      </ul>
    {{else}}
      <p class="no-group" data-test-no-course-objectives-message>{{t
          "general.missingCourseObjectivesMessage"
        }}</p>
    {{/if}}
  </section>
</template>
