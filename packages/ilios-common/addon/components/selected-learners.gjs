import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import UserNameInfo from 'ilios-common/components/user-name-info';
import UserStatus from 'ilios-common/components/user-status';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <div class="selected-learners" data-test-selected-learners ...attributes>
    <label data-test-heading>
      {{t "general.selectedLearners"}}:
    </label>
    {{#if @learners.length}}
      <ul class="learners-list" data-test-selected-learners-list>
        {{#each (sortBy "fullName" @learners) as |user|}}
          {{#if @isManaging}}
            <li>
              <button type="button" {{on "click" (fn @remove user)}}>
                <UserStatus @user={{user}} />
                <UserNameInfo @user={{user}} />
                <FaIcon @icon="xmark" class="remove" />
              </button>
            </li>
          {{else}}
            <li>
              <UserStatus @user={{user}} />
              <UserNameInfo @user={{user}} />
            </li>
          {{/if}}
        {{/each}}
      </ul>
    {{else}}
      <div data-test-no-selected-learners>
        {{t "general.none"}}
      </div>
    {{/if}}
  </div>
</template>
