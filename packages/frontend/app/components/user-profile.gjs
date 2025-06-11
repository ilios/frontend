import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import ManageUsersSummary from 'frontend/components/manage-users-summary';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import UserNameInfo from 'ilios-common/components/user-name-info';
import PendingSingleUserUpdate from 'frontend/components/pending-single-user-update';
import ToggleButtons from 'ilios-common/components/toggle-buttons';
import not from 'ember-truth-helpers/helpers/not';
import toggle from 'ilios-common/helpers/toggle';
import UserProfileCalendar from 'frontend/components/user-profile-calendar';
import UserProfileBio from 'frontend/components/user-profile-bio';
import UserProfileRoles from 'frontend/components/user-profile-roles';
import UserProfileCohorts from 'frontend/components/user-profile-cohorts';
import UserProfileIcs from 'frontend/components/user-profile-ics';
import and from 'ember-truth-helpers/helpers/and';
import eq from 'ember-truth-helpers/helpers/eq';
import UserProfilePermissions from 'frontend/components/user-profile-permissions';
import LearnerGroups from 'frontend/components/user-profile/learner-groups';

export default class UserProfileComponent extends Component {
  @service currentUser;
  @tracked showCalendar = false;
  <template>
    <div class="user-profile" data-test-user-profile ...attributes>
      <div class="blocks">
        <ManageUsersSummary @canCreate={{@canCreate}} />
      </div>
      <h1 class="user-display-name">
        {{#unless @user.enabled}}
          <FaIcon @icon="user-xmark" class="disabled-user" @title={{t "general.disabled"}} />
        {{/unless}}
        <UserNameInfo @user={{@user}} />
      </h1>
      <div class="user-roles">
        {{#if @user.isStudent}}
          <span class="user-is-student">
            {{t "general.student"}}
          </span>
        {{/if}}
      </div>
      <PendingSingleUserUpdate @user={{@user}} @canUpdate={{@canUpdate}} />
      <div class="user-profile-actions" data-test-user-profile-actions>
        <ToggleButtons
          @firstOptionSelected={{not this.showCalendar}}
          @firstLabel={{t "general.hideCalendar"}}
          @secondLabel={{t "general.showCalendar"}}
          @toggle={{toggle "showCalendar" this}}
        />
      </div>
      <div class="blocks">
        {{#if this.showCalendar}}
          <UserProfileCalendar @user={{@user}} />
        {{/if}}
        <UserProfileBio
          @user={{@user}}
          @isManageable={{@canUpdate}}
          @isManaging={{@isManagingBio}}
          @setIsManaging={{@setIsManagingBio}}
        />
        <UserProfileRoles
          @user={{@user}}
          @isManageable={{@canUpdate}}
          @isManaging={{@isManagingRoles}}
          @setIsManaging={{@setIsManagingRoles}}
        />
        <UserProfileCohorts
          @user={{@user}}
          @isManageable={{@canUpdate}}
          @isManaging={{@isManagingCohorts}}
          @setIsManaging={{@setIsManagingCohorts}}
        />
        <UserProfileIcs
          @user={{@user}}
          @isManageable={{and @canUpdate (eq this.currentUser.currentUserId @user.id)}}
          @isManaging={{@isManagingIcs}}
          @setIsManaging={{@setIsManagingIcs}}
        />
        <UserProfilePermissions
          @user={{@user}}
          @selectedSchoolId={{@permissionsSchool}}
          @selectedYearId={{@permissionsYear}}
          @setSchool={{@setPermissionsSchool}}
          @setYear={{@setPermissionsYear}}
        />

        <LearnerGroups @user={{@user}} />
      </div>
    </div>
  </template>
}
