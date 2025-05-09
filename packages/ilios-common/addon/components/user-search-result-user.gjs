import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import includes from 'ilios-common/helpers/includes';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
<template>
  {{#if (and @user.enabled (not (includes @user @currentlyActiveUsers)))}}
    <li class="active" data-test-result>
      <button class="link-button" type="button" {{on "click" (fn @addUser @user)}}>
        <div class="name">
          {{@user.fullName}}
        </div>
        <div class="email">
          {{@user.email}}
        </div>
      </button>
    </li>
  {{else}}
    <li class="inactive" data-test-result>
      <div class="name">
        {{@user.fullName}}
        {{#unless @user.enabled}}
          <FaIcon @icon="user-xmark" @title={{t "general.disabled"}} class="error" />
        {{/unless}}
      </div>
      <div class="email">
        {{@user.email}}
      </div>
    </li>
  {{/if}}
</template>
