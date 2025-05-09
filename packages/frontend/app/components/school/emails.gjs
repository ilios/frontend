import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
<template>
  <section class="school-emails" data-test-school-emails ...attributes>
    <div class="header">
      <div class="title" data-test-title>{{t "general.emails"}}</div>
      <div class="actions">
        {{#if @canUpdate}}
          <button type="button" {{on "click" (fn @manage true)}} data-test-manage>
            {{t "general.manageEmails"}}
          </button>
        {{/if}}
      </div>
    </div>
    <div class="content">
      <div data-test-administrator-email>
        <strong>{{t "general.administratorEmail"}}:</strong>
        <span>{{@school.iliosAdministratorEmail}}</span>
      </div>
      <div data-test-change-alert-recipients>
        <strong>{{t "general.changeAlertRecipients"}}:</strong>
        <span>{{@school.changeAlertRecipients}}</span>
      </div>
    </div>
  </section>
</template>
