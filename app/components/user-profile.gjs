import Component from '@glimmer/component';
import { service } from '@ember/service';
import ManageUsersSummary from './manage-users-summary';
import t from 'ember-intl/helpers/t';
import UserNameInfo from 'ilios-common/components/user-name-info';
import UserStatus from 'ilios-common/components/user-status';
import PendingSingleUserUpdate from './pending-single-user-update';
import ToggleButtons from 'ilios-common/components/toggle-buttons';
import { and, not } from 'ember-truth-helpers';
import UserProfileCalendar from './user-profile-calendar';
import UserProfileBio from './user-profile-bio';
import UserProfileRoles from './user-profile-roles';
import UserProfileCohorts from './user-profile-cohorts';
import UserProfileIcs from './user-profile-ics';
import UserProfilePermissions from './user-profile-permissions';
import LearnerGroups from './user-profile/learner-groups';

export default class UserProfileComponent extends Component {
  @service currentUser;

  get userIsTheCurrentUser() {
    return Number(this.currentUser.currentUserId) === Number(this.args.user.id);
  }
  <template>
    <div class="user-profile main-section" data-test-user-profile ...attributes>
      <div class="admin-block">
        <ManageUsersSummary @canCreate={{@canCreate}} />
      </div>
      <h1 class="user-display-name" data-test-user-profile-title>
        <UserStatus @user={{@user}} />
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
          @firstOptionSelected={{not @showCalendar}}
          @firstLabel={{t "general.hideCalendar"}}
          @secondLabel={{t "general.showCalendar"}}
          @toggle={{@setShowCalendar}}
        />
      </div>
      <div class="admin-block">
        {{#if @showCalendar}}
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
          @isManageable={{and @canUpdate this.userIsTheCurrentUser}}
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
