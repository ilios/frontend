import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn, uniqueId } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
<template>
  <div class="user-profile-bio-details" data-test-user-profile-bio-details ...attributes>
    <div class="actions">
      {{#if @isManageable}}
        <button
          aria-label={{t "general.manage"}}
          type="button"
          class="manage"
          {{on "click" (fn @setIsManaging true)}}
          data-test-manage
        >
          <FaIcon @icon={{faPenToSquare}} />
        </button>
      {{/if}}
    </div>

    {{#unless @userAuthentication.username}}
      <div class="error" data-test-username-missing>
        {{t "general.missingRequiredUsername"}}
      </div>
    {{/unless}}

    <p class="primary-school" data-test-school>
      <strong>
        {{t "general.primarySchool"}}:
      </strong>
      {{@user.school.title}}
    </p>

    {{#let (uniqueId) as |templateId|}}
      <div class="form">
        <div class="item" data-test-firstname>
          <label for="firstname-{{templateId}}">
            {{t "general.firstName"}}:
          </label>
          <span class="value">
            {{@user.firstName}}
          </span>
        </div>
        <div class="item" data-test-middlename>
          <label for="middlename-{{templateId}}">
            {{t "general.middleName"}}:
          </label>
          <span class="value">
            {{@user.middleName}}
          </span>
        </div>
        <div class="item" data-test-lastname>
          <label for="lastname-{{templateId}}">
            {{t "general.lastName"}}:
          </label>
          <span class="value">
            {{@user.lastName}}
          </span>
        </div>
        <div class="item campus-id" data-test-campus-id>
          <label for="campus-id-{{templateId}}">
            {{t "general.campusId"}}:
          </label>
          <span class="value">
            {{@user.campusId}}
          </span>
        </div>
        <div class="item" data-test-other-id>
          <label for="other-id-{{templateId}}">
            {{t "general.otherId"}}:
          </label>
          <span class="value">
            {{@user.otherId}}
          </span>
        </div>
        <div class="item" data-test-email>
          <label for="email-{{templateId}}">
            {{t "general.email"}}:
          </label>
          <span class="value">
            {{@user.email}}
          </span>
        </div>
        <div class="item" data-test-displayname>
          <label for="displayname-{{templateId}}">
            {{t "general.displayName"}}:
          </label>
          <span class="value">
            {{@user.displayName}}
          </span>
        </div>
        <div class="item" data-test-pronouns>
          <label for="pronouns-{{templateId}}">
            {{t "general.pronouns"}}:
          </label>
          <span class="value">
            {{@user.pronouns}}
          </span>
        </div>
        <div class="item" data-test-preferred-email>
          <label for="preferred-email-{{templateId}}">
            {{t "general.preferredEmail"}}:
          </label>
          <span class="value">
            {{@user.preferredEmail}}
          </span>
        </div>
        <div class="item" data-test-phone>
          <label for="phone-{{templateId}}">
            {{t "general.phone"}}:
          </label>
          <span class="value">
            {{@user.phone}}
          </span>
        </div>
        <div class="item" data-test-username>
          <label for="username-{{templateId}}">
            {{t "general.username"}}:
          </label>
          <span class="value">
            {{@userAuthentication.username}}
          </span>
        </div>
        {{#if @canEditUsernameAndPassword}}
          <div class="item password" data-test-password>
            <label for="password-{{templateId}}">
              {{t "general.password"}}:
            </label>
            <span class="value">
              {{#if @userAuthentication.username}}
                *********
              {{/if}}
            </span>
          </div>
        {{/if}}
      </div>
    {{/let}}
  </div>
</template>
