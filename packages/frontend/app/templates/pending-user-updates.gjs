import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import BackToAdminDashboard from 'frontend/components/back-to-admin-dashboard';
import FaIcon from 'ilios-common/components/fa-icon';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import { LinkTo } from '@ember/routing';
import UserNameInfo from 'ilios-common/components/user-name-info';
import { concat } from '@ember/helper';
import includes from 'ilios-common/helpers/includes';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import perform from 'ember-concurrency/helpers/perform';
<template>
  {{pageTitle (t "general.admin") " | " (t "general.pendingUpdatesSummaryTitle")}}
  <BackToAdminDashboard />
  <section class="pending-user-updates">
    <div class="filters">
      <div class="schoolsfilter" data-test-school-filter>
        <FaIcon @icon="building-columns" @fixedWidth={{true}} />
        {{#if @controller.hasMoreThanOneSchool}}
          <select
            aria-label={{t "general.filterBySchool"}}
            {{on "change" (pick "target.value" (set @controller "school"))}}
          >
            {{#each (sortBy "title" @controller.model.schools) as |school|}}
              <option value={{school.id}} selected={{eq school @controller.selectedSchool}}>
                {{school.title}}
              </option>
            {{/each}}
          </select>
        {{else}}
          {{@controller.selectedSchool.title}}
        {{/if}}
      </div>
      <div class="titlefilter" data-test-title-filter>
        <input
          aria-label={{t "general.filterByTitle"}}
          type="text"
          value={{@controller.filter}}
          {{on "input" (pick "target.value" (set @controller "filter"))}}
          placeholder={{t "general.pendingUserUpdates.filterBy"}}
        />
      </div>
    </div>
    <div class="updates">
      <div class="list" data-test-pending-updates>
        <table class="ilios-zebra-table">
          <thead>
            <tr>
              <th class="text-left" colspan="2">
                {{t "general.fullName"}}
              </th>
              <th class="text-left" colspan="6">
                {{t "general.description"}}
              </th>
              <th class="text-left" colspan="3">
                {{t "general.actions"}}
              </th>
            </tr>
          </thead>
          <tbody>
            {{#each (sortBy "user.fullName" @controller.displayedUpdates) as |update|}}
              <tr data-test-pending-update>
                <td class="text-left" colspan="2">
                  <LinkTo @route="user" @model={{update.user}}>
                    <UserNameInfo @user={{update.user}} />
                  </LinkTo>
                </td>
                <td class="text-left" colspan="6" data-test-update-type>
                  {{#if (eq update.type "emailMismatch")}}
                    {{t
                      "general.pendingUserUpdates.emailMismatch"
                      value=update.value
                      email=update.user.email
                    }}
                  {{else}}
                    {{t (concat "general.pendingUserUpdates." update.type)}}
                  {{/if}}
                </td>
                <td class="text-left" colspan="3">
                  {{#if (includes update @controller.updatesBeingSaved)}}
                    <LoadingSpinner />
                  {{else}}
                    {{#if (eq update.type "emailMismatch")}}
                      <button
                        type="button"
                        {{on "click" (perform @controller.updateEmailAddress update)}}
                        data-test-update-email
                      >
                        <FaIcon @icon="circle-arrow-up" class="yes" @title={{t "general.update"}} />
                        {{t "general.pendingUserUpdates.updateIlios"}}
                      </button>
                      <br />
                    {{/if}}
                    <button
                      type="button"
                      {{on "click" (perform @controller.excludeFromSync update)}}
                      data-test-exclude-from-sync
                    >
                      <FaIcon @icon="ban" class="no" @title={{t "general.excludeFromSync"}} />
                      {{t "general.excludeFromSync"}}
                    </button>
                    <br />
                    <button
                      type="button"
                      {{on "click" (perform @controller.disableUser update)}}
                      data-test-disable-user
                    >
                      <FaIcon @icon="xmark" class="no" @title={{t "general.disableUser"}} />
                      {{t "general.disableUser"}}
                    </button>
                  {{/if}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
