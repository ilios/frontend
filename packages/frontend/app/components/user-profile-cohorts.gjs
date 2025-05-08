<div
  class="user-profile-cohorts small-component
    {{if this.hasSavedRecently 'has-saved' 'has-not-saved'}}"
  data-test-user-profile-cohorts
  ...attributes
>
  {{#if this.isLoaded}}
    <div class="user-profile-cohorts-header">
      <h3 class="title" data-test-title>
        {{t "general.cohorts"}}
      </h3>
      <div class="actions">
        {{#if @isManaging}}
          <button
            type="button"
            disabled={{or this.save.isRunning this.cancel.isRunning}}
            class="bigadd"
            {{on "click" (perform this.save)}}
            data-test-save
          >
            <FaIcon
              @icon={{if this.save.isRunning "spinner" "check"}}
              @spin={{this.save.isRunning}}
            />
          </button>
          <button
            type="button"
            disabled={{or this.save.isRunning this.cancel.isRunning}}
            class="bigcancel"
            {{on "click" (perform this.cancel)}}
            data-test-cancel
          >
            <FaIcon @icon="arrow-rotate-left" />
          </button>
        {{else if @isManageable}}
          <button
            type="button"
            class="manage"
            {{on "click" (fn @setIsManaging true)}}
            data-test-manage
          >
            <FaIcon @icon="pen-to-square" />
          </button>
        {{/if}}
      </div>
    </div>
    {{#if @isManaging}}
      <UserProfileCohortsManager
        @primaryCohort={{this.currentPrimaryCohort}}
        @secondaryCohorts={{this.secondaryCohorts}}
        @addSecondaryCohort={{this.addSecondaryCohort}}
        @removeSecondaryCohort={{this.removeSecondaryCohort}}
        @setPrimaryCohort={{set this "newPrimaryCohort"}}
        @schools={{this.selectedableSchools}}
        @selectedSchool={{this.currentSchool}}
        @setSchool={{set this "selectedSchool"}}
      />
    {{else}}
      <UserProfileCohortsDetails
        @primaryCohort={{this.primaryCohort}}
        @secondaryCohorts={{this.secondaryCohorts}}
      />
    {{/if}}
  {{/if}}
</div>