import t from 'ember-intl/helpers/t';
import sortBy from 'ilios-common/helpers/sort-by';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import SelectedInstructorGroupMembers from 'ilios-common/components/selected-instructor-group-members';
<template>
  <div class="selected-instructor-groups" data-test-selected-instructor-groups ...attributes>
    <label class="heading" data-test-heading>
      {{t "general.selectedInstructorGroups"}}:
      {{#if @showDefaultNotLoaded}}
        <span class="label-description">({{t "general.defaultNotLoaded"}})</span>
      {{/if}}
    </label>
    <div data-test-selected-instructor-groups>
      {{#each (sortBy "title" @instructorGroups) as |instructorGroup|}}
        <div class="instructor-group" data-test-selected-instructor-group>
          <ul class="instructor-group-title" data-test-instructor-group-title>
            <li>
              {{#if @isManaging}}
                <button type="button" {{on "click" (fn @remove instructorGroup)}} data-test-remove>
                  <FaIcon @icon="users" />
                  {{instructorGroup.title}}
                  <FaIcon @icon="xmark" class="remove" />
                </button>
              {{else}}
                <FaIcon @icon="users" />
                {{instructorGroup.title}}
              {{/if}}
            </li>
          </ul>
          <SelectedInstructorGroupMembers @instructorGroup={{instructorGroup}} />
        </div>
      {{else}}
        <div data-test-no-selected-instructor-groups>{{t "general.none"}}</div>
      {{/each}}
    </div>
  </div>
</template>
