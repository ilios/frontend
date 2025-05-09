import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import UserNameInfo from 'ilios-common/components/user-name-info';
import FaIcon from 'ilios-common/components/fa-icon';
import UserSearch from 'ilios-common/components/user-search';
<template>
  <section
    class="instructor-group-instructor-manager"
    data-test-instructor-group-instructor-manager
    ...attributes
  >
    <div class="selected-instructors" data-test-selected-instructors>
      <label class="sub-title">{{t "general.selectedInstructors"}}:</label>
      {{#if @instructors.length}}
        <ul class="instructor-list">
          {{#each (sortBy "fullName" @instructors) as |user|}}
            <li data-test-selected-instructor>
              <button type="button" {{on "click" (fn @remove user)}} data-test-remove>
                <UserNameInfo @user={{user}} />
                <FaIcon @icon="xmark" class="remove" />
              </button>
            </li>
          {{/each}}
        </ul>
      {{else}}
        <div data-test-no-selected-instructors>
          {{t "general.none"}}
        </div>
      {{/if}}
    </div>
    <div class="available-instructors" data-test-available-instructors>
      <label class="sub-title">{{t "general.availableInstructors"}}:</label>
      <UserSearch
        @addUser={{@add}}
        @currentlyActiveUsers={{@instructors}}
        @placeholder={{t "general.findInstructor"}}
      />
    </div>
  </section>
</template>
