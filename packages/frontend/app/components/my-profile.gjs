import t from 'ember-intl/helpers/t';
import UserProfileRoles from './user-profile-roles';
import sortBy from 'ilios-common/helpers/sort-by';
import UserProfilePermissions from './user-profile-permissions';
import LearnerGroups from './user-profile/learner-groups';
import ThemeChooser from './user-profile/theme-chooser';
import LocaleChooser from './user-profile/locale-chooser';
import TokenMaintenance from './user-profile/token-maintenance';

<template>
  <div class="my-profile main-section" ...attributes data-test-my-profile>
    <h1 class="name" data-test-name>
      {{@user.fullName}}
    </h1>
    {{#if @user.isStudent}}
      <span class="is-student" data-test-is-student>
        <h2>
          {{t "general.student"}}
        </h2>
      </span>
    {{/if}}
    <div class="admin-block">
      <UserProfileRoles @user={{@user}} @isManageable={{false}} />
      <div class="small-component my-profile-schools" data-test-info>
        <div>
          <label>
            {{t "general.primarySchool"}}:
          </label>
          <span data-test-primary-school>
            {{@user.school.title}}
          </span>
        </div>
        <div>
          <label>
            {{t "general.primaryCohort"}}:
          </label>
          <span data-test-primary-cohort>
            {{#if @user.primaryCohort}}
              {{@user.primaryCohort.title}}
            {{else}}
              {{t "general.unassigned"}}
            {{/if}}
          </span>
        </div>
        <div>
          <label>
            {{t "general.secondaryCohorts"}}:
          </label>
          {{#if @user.secondaryCohorts.length}}
            <ul class="secondary-cohorts details-list">
              {{#each (sortBy "title" @user.secondaryCohorts) as |cohort|}}
                <li data-test-secondary-cohort>
                  <span class="title">
                    {{cohort.title}}
                  </span>
                  <span class="content">
                    {{cohort.programYear.program.title}}
                  </span>
                </li>
              {{/each}}
            </ul>
          {{else}}
            <span data-test-secondary-cohort>{{t "general.unassigned"}}</span>
          {{/if}}
        </div>
      </div>
      <ThemeChooser />
      <LocaleChooser />
      <UserProfilePermissions
        @user={{@user}}
        @selectedSchoolId={{@permissionsSchool}}
        @selectedYearId={{@permissionsYear}}
        @setSchool={{@setPermissionsSchool}}
        @setYear={{@setPermissionsYear}}
      />
      <LearnerGroups @user={{@user}} />

      <TokenMaintenance
        @showCreateNewToken={{@showCreateNewToken}}
        @toggleShowCreateNewToken={{@toggleShowCreateNewToken}}
        @showInvalidateTokens={{@showInvalidateTokens}}
        @toggleShowInvalidateTokens={{@toggleShowInvalidateTokens}}
      />
    </div>
  </div>
</template>
