<div class="user-profile" data-test-user-profile ...attributes>
  <div class="blocks">
    <ManageUsersSummary @canCreate={{@canCreate}} />
  </div>
  <h1 class="user-display-name">
    {{#unless @user.enabled}}
      <FaIcon @icon="ban" class="no" @title={{t "general.disabled"}} />
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

    <UserProfile::LearnerGroups @user={{@user}} />
  </div>
</div>