import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <div class="token-login">
    {{#let (uniqueId) as |templateId|}}
      <label for="token-{{templateId}}">{{t "general.token"}}: </label>
      <input
        id="token-{{templateId}}"
        type="text"
        value={{@controller.jwt}}
        {{on "input" (pick "target.value" (set @controller "jwt"))}}
        {{on "keypress" (perform @controller.loginOnEnter)}}
        disabled={{@controller.login.isRunning}}
      />
      <button
        type="button"
        disabled={{@controller.login.isRunning}}
        {{on "click" (perform @controller.login)}}
      >
        {{#if @controller.login.isRunning}}
          <FaIcon @icon="spinner" @spin={{true}} />
        {{/if}}
        {{t "general.login"}}
      </button>
    {{/let}}
    <p>{{@controller.error}}</p>
  </div>
</template>
