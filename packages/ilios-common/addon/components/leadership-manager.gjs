import t from 'ember-intl/helpers/t';
import LeadershipSearch from 'ilios-common/components/leadership-search';
import sortBy from 'ilios-common/helpers/sort-by';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import UserNameInfo from 'ilios-common/components/user-name-info';
import UserStatus from 'ilios-common/components/user-status';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

<template>
  <div class="leadership-manager" data-test-leadership-manager>
    <table class="ilios-table ilios-table-colors">
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
            <td data-test-director-search>
              <LeadershipSearch @existingUsers={{@directors}} @selectUser={{@addDirector}} />
            </td>
          {{/if}}
          {{#if @showAdministrators}}
            <td data-test-administrator-search>
              <LeadershipSearch
                @existingUsers={{@administrators}}
                @selectUser={{@addAdministrator}}
              />
            </td>
          {{/if}}
          {{#if @showStudentAdvisors}}
            <td data-test-student-advisor-search>
              <LeadershipSearch
                @existingUsers={{@studentAdvisors}}
                @selectUser={{@addStudentAdvisor}}
              />
            </td>
          {{/if}}
        </tr>
        <tr>
          {{#if @showDirectors}}
            <td class="text-top" data-test-directors>
              <ul>
                {{#each (sortBy "fullName" @directors) as |user|}}
                  <li data-test-director>
                    <button
                      class="link-button"
                      type="button"
                      aria-label={{t "general.remove"}}
                      {{on "click" (fn @removeDirector user)}}
                    >
                      <FaIcon @icon={{faXmark}} class="clickable remove" />
                    </button>
                    <UserStatus @user={{user}} />
                    <UserNameInfo @user={{user}} />
                  </li>
                {{else}}
                  <li>
                    {{t "general.none"}}
                  </li>
                {{/each}}
              </ul>
            </td>
          {{/if}}
          {{#if @showAdministrators}}
            <td class="text-top" data-test-administrators>
              <ul>
                {{#each (sortBy "fullName" @administrators) as |user|}}
                  <li data-test-administrator>
                    <button
                      class="link-button"
                      type="button"
                      aria-label={{t "general.remove"}}
                      {{on "click" (fn @removeAdministrator user)}}
                    >
                      <FaIcon @icon={{faXmark}} class="clickable remove" />
                    </button>
                    <UserStatus @user={{user}} />
                    <UserNameInfo @user={{user}} />
                  </li>
                {{else}}
                  <li>
                    {{t "general.none"}}
                  </li>
                {{/each}}
              </ul>
            </td>
          {{/if}}
          {{#if @showStudentAdvisors}}
            <td class="text-top" data-test-student-advisors>
              <ul>
                {{#each (sortBy "fullName" @studentAdvisors) as |user|}}
                  <li data-test-student-advisor>
                    <button
                      class="link-button"
                      type="button"
                      aria-label={{t "general.remove"}}
                      {{on "click" (fn @removeStudentAdvisor user)}}
                    >
                      <FaIcon @icon={{faXmark}} class="clickable remove" />
                    </button>
                    <UserStatus @user={{user}} />
                    <UserNameInfo @user={{user}} />
                  </li>
                {{else}}
                  <li>
                    {{t "general.none"}}
                  </li>
                {{/each}}
              </ul>
            </td>
          {{/if}}
        </tr>
      </tbody>
    </table>
  </div>
</template>
