import not from 'ember-truth-helpers/helpers/not';
import includes from 'ilios-common/helpers/includes';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
<template>
  {{#if (not (includes @group @currentlyActiveInstructorGroups))}}
    <li class="active" data-test-result>
      <button class="link-button" type="button" {{on "click" (fn @addInstructorGroup @group)}}>
        {{@group.title}}
      </button>
    </li>
  {{else}}
    <li class="inactive" data-test-result>
      {{@group.title}}
    </li>
  {{/if}}
</template>
