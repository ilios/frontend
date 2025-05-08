import t from 'ember-intl/helpers/t';
import isArray from 'ember-truth-helpers/helpers/is-array';
import sortBy from 'ilios-common/helpers/sort-by';
import FaIcon from 'ilios-common/components/fa-icon';
import UserNameInfo from 'ilios-common/components/user-name-info';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
<template>
  <div class="leadership-list" data-test-leadership-list>
    <table>
      <thead>
        <tr>
          {{#if @showDirectors}}
            <th>
              {{t "general.directors"}}
            </th>
          {{/if}}
          {{#if @showAdministrators}}
            <th>
              {{t "general.administrators"}}
            </th>
          {{/if}}
          {{#if @showStudentAdvisors}}
            <th>
              {{t "general.studentAdvisors"}}
            </th>
          {{/if}}
        </tr>
      </thead>
      <tbody>
        <tr>
          {{#if @showDirectors}}
            <td class="text-top" data-test-directors>
              <ul>
                {{#if (isArray @directors)}}
                  {{#each (sortBy "fullName" @directors) as |user|}}
                    <li>
                      {{#unless user.enabled}}
                        <FaIcon @icon="user-xmark" @title={{t "general.disabled"}} class="error" />
                      {{/unless}}
                      <UserNameInfo @user={{user}} />
                    </li>
                  {{else}}
                    <li>
                      {{t "general.none"}}
                    </li>
                  {{/each}}
                {{else}}
                  <LoadingSpinner />
                {{/if}}
              </ul>
            </td>
          {{/if}}
          {{#if @showAdministrators}}
            <td class="text-top" data-test-administrators>
              <ul>
                {{#if (isArray @administrators)}}
                  {{#each (sortBy "fullName" @administrators) as |user|}}
                    <li>
                      {{#unless user.enabled}}
                        <FaIcon @icon="user-xmark" @title={{t "general.disabled"}} class="error" />
                      {{/unless}}
                      <UserNameInfo @user={{user}} />
                    </li>
                  {{else}}
                    <li>
                      {{t "general.none"}}
                    </li>
                  {{/each}}
                {{else}}
                  <LoadingSpinner />
                {{/if}}
              </ul>
            </td>
          {{/if}}
          {{#if @showStudentAdvisors}}
            <td class="text-top" data-test-student-advisors>
              <ul>
                {{#if (isArray @studentAdvisors)}}
                  {{#each (sortBy "fullName" @studentAdvisors) as |user|}}
                    <li>
                      {{#unless user.enabled}}
                        <FaIcon @icon="user-xmark" @title={{t "general.disabled"}} class="error" />
                      {{/unless}}
                      <UserNameInfo @user={{user}} />
                    </li>
                  {{else}}
                    <li>
                      {{t "general.none"}}
                    </li>
                  {{/each}}
                {{else}}
                  <LoadingSpinner />
                {{/if}}
              </ul>
            </td>
          {{/if}}
        </tr>
      </tbody>
    </table>
  </div>
</template>
