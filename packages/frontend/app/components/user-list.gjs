import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import { LinkTo } from '@ember/routing';
import UserNameInfo from 'ilios-common/components/user-name-info';
<template>
  <div class="user-list" data-test-user-list ...attributes>
    <table>
      <thead>
        <tr>
          <th class="text-left" colspan="1"></th>
          <th class="text-left" colspan="3">
            {{t "general.fullName"}}
          </th>
          <th class="text-left hide-from-small-screen" colspan="2">
            {{t "general.campusId"}}
          </th>
          <th class="text-left hide-from-small-screen" colspan="5">
            {{t "general.email"}}
          </th>
          <th class="text-left hide-from-small-screen" colspan="2">
            {{t "general.primarySchool"}}
          </th>
        </tr>
      </thead>
      <tbody>
        {{#each @users as |user|}}
          <tr class={{unless user.enabled "disabled-user-account" ""}} data-test-user>
            <td class="text-left" colspan="1">
              {{#unless user.enabled}}
                <FaIcon
                  @icon="user-xmark"
                  @title={{t "general.disabled"}}
                  class="error"
                  data-test-disabled-user-icon
                />
              {{/unless}}
            </td>
            <td class="text-left" colspan="3">
              <LinkTo @route="user" @model={{user}} data-test-user-link>
                <UserNameInfo @user={{user}} />
              </LinkTo>
            </td>
            <td class="text-left hide-from-small-screen" colspan="2" data-test-campus-id>
              {{user.campusId}}
            </td>
            <td class="text-left hide-from-small-screen" colspan="5" data-test-email>
              {{user.email}}
            </td>
            <td class="text-left hide-from-small-screen" colspan="2" data-test-school>
              {{user.school.title}}
            </td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</template>
