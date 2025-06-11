import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import sortBy from 'ilios-common/helpers/sort-by';
import UserNameInfo from 'ilios-common/components/user-name-info';
import UserStatus from 'ilios-common/components/user-status';

<template>
  <div
    class="learner-group-instructors-list"
    data-test-learner-group-instructors-list
    ...attributes
  >
    <div class="detail-header">
      <div class="title" data-test-title>
        {{t "general.defaultInstructors"}}
        ({{@learnerGroup.allInstructors.length}})
      </div>
      {{#if @canUpdate}}
        <button type="button" {{on "click" @manage}} data-test-manage>
          {{t "general.instructorsManageTitle"}}
        </button>
      {{/if}}
    </div>
    <div class="detail-content">
      {{#if @learnerGroup.allInstructors.length}}
        <ul class="assigned-instructors">
          {{#each (sortBy "fullName" @learnerGroup.allInstructors) as |instructor|}}
            <li data-test-assigned-instructor>
              <UserStatus @user={{instructor}} />
              <UserNameInfo @user={{instructor}} />
            </li>
          {{/each}}
        </ul>
      {{/if}}
    </div>
  </div>
</template>
