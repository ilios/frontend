import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import UserNameInfo from 'ilios-common/components/user-name-info';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <div class="selected-instructors" data-test-selected-instructors ...attributes>
    <label class="heading" data-test-heading>
      {{t "general.selectedInstructors"}}:
      {{#if @showDefaultNotLoaded}}
        <span class="label-description">({{t "general.defaultNotLoaded"}})</span>
      {{/if}}
    </label>
    {{#if @instructors.length}}
      <ul class="instructors-list" data-test-selected-instructors-list>
        {{#each (sortBy "fullName" @instructors) as |user|}}
          {{#if @isManaging}}
            <li>
              <button type="button" {{on "click" (fn @remove user)}}>
                {{#unless user.enabled}}
                  <FaIcon
                    @icon="user-xmark"
                    @title={{t "general.disabled"}}
                    class="disabled-user"
                  />
                {{/unless}}
                <UserNameInfo @user={{user}} />
                <FaIcon @icon="xmark" class="remove" />
              </button>
            </li>
          {{else}}
            <li>
              {{#unless user.enabled}}
                <FaIcon @icon="user-xmark" @title={{t "general.disabled"}} class="disabled-user" />
              {{/unless}}
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
