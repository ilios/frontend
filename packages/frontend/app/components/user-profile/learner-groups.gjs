import load from 'ember-async-data/helpers/load';
import t from 'ember-intl/helpers/t';
import { gt } from 'ember-truth-helpers';
import sortBy from 'ilios-common/helpers/sort-by';
import LearnerGroup from 'frontend/components/user-profile/learner-group';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
<template>
  {{#let (load @user.learnerGroups) as |learnerGroups|}}
    <div
      class="user-profile-learnergroups large-component"
      data-test-user-profile-learner-groups
      ...attributes
    >
      <h2 class="title" data-test-title>
        {{t "general.learnerGroups"}}
      </h2>
      {{#if learnerGroups.isResolved}}
        <p>
          {{#if (gt learnerGroups.value.length 0)}}
            <ul>
              {{#each
                (sortBy
                  "cohort.programYear.program.school.title"
                  "cohort.programYear.program.title"
                  "cohort.title"
                  "sortTitle"
                  learnerGroups.value
                )
                as |learnerGroup|
              }}
                <LearnerGroup @learnerGroup={{learnerGroup}} />
              {{/each}}
            </ul>
          {{else}}
            {{t "general.none"}}
          {{/if}}
        </p>
      {{else}}
        <p>
          <LoadingSpinner />
        </p>
      {{/if}}
    </div>
  {{/let}}
</template>
