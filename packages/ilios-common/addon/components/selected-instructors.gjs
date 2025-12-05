import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import UserNameInfo from 'ilios-common/components/user-name-info';
import UserStatus from 'ilios-common/components/user-status';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
<template>
  <div class="selected-instructors" data-test-selected-instructors ...attributes>
    <label class="heading" data-test-heading>
      {{t "general.selectedInstructors"}}:
      {{#if @showDefaultNotLoaded}}
        <span class="label-description font-size-small">({{t "general.defaultNotLoaded"}})</span>
      {{/if}}
    </label>
    {{#if @instructors.length}}
      <ul class="instructors-list" data-test-selected-instructors-list>
        {{#each (sortBy "fullName" @instructors) as |user|}}
          {{#if @isManaging}}
            <li>
              <button type="button" {{on "click" (fn @remove user)}}>
                <UserStatus @user={{user}} />
                <UserNameInfo @user={{user}} />
                <FaIcon @icon={{faXmark}} class="remove" />
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
      <div data-test-no-selected-instructors>
        {{t "general.none"}}
      </div>
    {{/if}}
  </div>
</template>
