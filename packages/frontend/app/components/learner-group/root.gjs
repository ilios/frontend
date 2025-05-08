{{#let (unique-id) as |templateId|}}
  <section class="learner-group-root" data-test-learner-group-root ...attributes>
    {{#if this.isSavingGroups}}
      <WaitSaving
        @showProgress={{true}}
        @totalProgress={{this.totalGroupsToSave}}
        @currentProgress={{this.currentGroupsSaved}}
      />
    {{/if}}
    <LearnerGroup::Header
      @learnerGroup={{@learnerGroup}}
      @sortUsersBy={{this.sortUsersBy}}
      @canUpdate={{@canUpdate}}
    />
    <section class="learner-group-overview" data-test-overview>
      <div class="block" data-test-needs-accommodation>
        <label>{{t "general.accommodationIsRequiredForLearnersInThisGroup"}}:</label>
        <span>
          {{#if @canUpdate}}
            <ToggleYesno
              @yes={{@learnerGroup.needsAccommodation}}
              @toggle={{perform this.changeNeedsAccommodation}}
            />
          {{else}}
            {{#if @learnerGroup.needsAccommodation}}
              <span class="add">{{t "general.yes"}}</span>
            {{else}}
              <span class="remove">{{t "general.no"}}</span>
            {{/if}}
          {{/if}}
        </span>
      </div>
      <div class="block defaultlocation" data-test-location>
        <label for="location-{{templateId}}">
          {{t "general.defaultLocation"}}:
        </label>
        <span>
          {{#if @canUpdate}}
            <EditableField
              @value={{if this.location this.location (t "general.clickToEdit")}}
              @save={{perform this.changeLocation}}
              @close={{this.revertLocationChanges}}
              @saveOnEnter={{true}}
              @closeOnEscape={{true}}
              as |isSaving|
            >
              <input
                id="location-{{templateId}}"
                type="text"
                value={{this.location}}
                disabled={{isSaving}}
                {{on "input" (pick "target.value" (set this "location"))}}
                {{on "keyup" (fn this.addErrorDisplayFor "location")}}
              />
              <ValidationError @validatable={{this}} @property="location" />
            </EditableField>
          {{else if this.location}}
            {{this.location}}
          {{else}}
            {{t "general.none"}}
          {{/if}}
        </span>
      </div>
      <div class="block defaulturl" data-test-url>
        <label for="link-{{templateId}}">
          {{t "general.defaultVirtualLearningLink"}}:
        </label>
        <span>
          {{#if @canUpdate}}
            <EditableField
              @value={{if this.url this.url (t "general.clickToEdit")}}
              @save={{perform this.saveUrlChanges}}
              @close={{this.revertUrlChanges}}
              @saveOnEnter={{true}}
              @closeOnEscape={{true}}
              as |isSaving|
            >
              {{! template-lint-disable no-bare-strings}}
              <input
                id="link-{{templateId}}"
                type="text"
                placeholder="https://example.com"
                value={{this.bestUrl}}
                inputmode="url"
                {{on "input" (pick "target.value" this.changeUrl)}}
                {{on "keyup" (fn this.addErrorDisplayFor "url")}}
                {{on "focus" this.selectAllText}}
                disabled={{isSaving}}
              />
              <ValidationError @validatable={{this}} @property="url" />
            </EditableField>
          {{else if this.url}}
            {{this.url}}
          {{else}}
            {{t "general.none"}}
          {{/if}}
        </span>
      </div>
      <div class="block associatedcourses" data-test-courses>
        <label>
          {{t "general.associatedCourses"}}
          ({{this.courses.length}}):
        </label>
        <ul>
          {{#each (sort-by "courseTitle" this.courses) as |obj|}}
            <li>
              <LinkTo @route="course" @model={{obj.course}}>
                {{obj.courseTitle}}
                {{#if this.academicYearCrossesCalendarYearBoundaries}}
                  ({{obj.course.year}}
                  -
                  {{add obj.course.year 1}})
                {{else}}
                  ({{obj.course.year}})
                {{/if}}
              </LinkTo>
            </li>
          {{/each}}
        </ul>
      </div>
      {{#if (and this.dataForInstructorGroupManagerLoaded this.isManagingInstructors)}}
        <LearnerGroup::InstructorManager
          @learnerGroup={{@learnerGroup}}
          @instructors={{this.instructors}}
          @instructorGroups={{this.instructorGroups}}
          @availableInstructorGroups={{this.availableInstructorGroups}}
          @save={{perform this.saveInstructors}}
          @cancel={{set this "isManagingInstructors" false}}
        />
      {{else}}
        <LearnerGroup::InstructorsList
          @learnerGroup={{@learnerGroup}}
          @canUpdate={{@canUpdate}}
          @manage={{set this "isManagingInstructors" true}}
        />
      {{/if}}
      <div class="learner-group-overview-actions" data-test-overview-actions>
        <div class="title" data-test-title>
          {{#if @isEditing}}
            {{t "general.manageGroupMembership"}}
          {{else if @isBulkAssigning}}
            {{t "general.uploadGroupAssignments"}}
          {{else}}
            {{t "general.members"}}
            ({{this.usersForUserManager.length}})
          {{/if}}
        </div>
        <span class="actions" data-test-buttons>
          {{#if (or @isEditing @isBulkAssigning)}}
            <button
              class="close"
              type="button"
              {{on "click" (pipe (fn @setIsEditing false) (fn @setIsBulkAssigning false))}}
              data-test-close
            >
              {{t "general.close"}}
            </button>
          {{else}}
            <ToggleButtons
              @firstOptionSelected={{not this.showLearnerGroupCalendar}}
              @firstLabel={{t "general.hideCalendar"}}
              @secondLabel={{t "general.showCalendar"}}
              @toggle={{toggle "showLearnerGroupCalendar" this}}
            />
            {{#if @canUpdate}}
              <button
                class="bulk-assign"
                type="button"
                data-test-activate-bulk-assign
                {{on "click" (fn @setIsBulkAssigning true)}}
              >
                {{t "general.uploadGroupAssignments"}}
              </button>
              <button
                class="manage"
                type="button"
                data-test-manage
                {{on "click" (fn @setIsEditing true)}}
              >
                {{t "general.manage"}}
              </button>
            {{/if}}
          {{/if}}
        </span>
      </div>
      {{#if @isBulkAssigning}}
        <LearnerGroup::BulkAssignment
          @learnerGroup={{@learnerGroup}}
          @done={{fn @setIsBulkAssigning false}}
        />
      {{else if @isEditing}}
        <div class="learner-group-overview-content">
          <LearnerGroup::UserManager
            @learnerGroupId={{this.learnerGroupId}}
            @learnerGroupTitle={{this.learnerGroupTitle}}
            @topLevelGroupTitle={{this.topLevelGroupTitle}}
            @cohortTitle={{this.cohortTitle}}
            @users={{this.usersForUserManager}}
            @sortBy={{this.sortUsersBy}}
            @setSortBy={{@setSortUsersBy}}
            @addUserToGroup={{perform this.addUserToGroup}}
            @removeUserFromGroup={{perform this.removeUserToCohort}}
            @addUsersToGroup={{perform this.addUsersToGroup}}
            @removeUsersFromGroup={{perform this.removeUsersToCohort}}
          />
        </div>
      {{else}}
        {{#if this.showLearnerGroupCalendar}}
          <LearnerGroup::Calendar @learnerGroup={{@learnerGroup}} />
        {{/if}}
        <div class="learner-group-overview-content">
          <LearnerGroup::Members
            @learnerGroupId={{this.learnerGroupId}}
            @setSortBy={{@setSortUsersBy}}
            @sortBy={{this.sortUsersBy}}
            @users={{this.usersForMembersList}}
          />
        </div>
      {{/if}}
      <section class="subgroups" data-test-subgroups>
        <div class="header">
          <h3 class="title">
            {{t "general.subgroups"}}
            ({{this.learnerGroups.length}})
          </h3>
          <div class="actions">
            {{#if @canCreate}}
              <ExpandCollapseButton
                @value={{this.showNewLearnerGroupForm}}
                @action={{set this "showNewLearnerGroupForm" (not this.showNewLearnerGroupForm)}}
                @expandButtonLabel={{t "general.expand"}}
                @collapseButtonLabel={{t "general.close"}}
              />
            {{/if}}
          </div>
        </div>
        <div class="new">
          {{#if this.showNewLearnerGroupForm}}
            <LearnerGroup::New
              @save={{perform this.saveNewLearnerGroup}}
              @cancel={{set this "showNewLearnerGroupForm" false}}
              @generateNewLearnerGroups={{this.generateNewLearnerGroups}}
              @multiModeSupported={{true}}
            />
          {{/if}}
          {{#if this.newLearnerGroup}}
            <div class="saved-result">
              <LinkTo @route="learner-group" @model={{this.newLearnerGroup}}>
                <FaIcon @icon="square-up-right" />
                {{this.newLearnerGroup.title}}
              </LinkTo>
              {{t "general.savedSuccessfully"}}
            </div>
          {{/if}}
        </div>
        <div class="list{{if (eq @learnerGroup.childrenCount 0) ' empty'}}">
          {{#if @learnerGroup.childrenCount}}
            <LearnerGroup::List
              @learnerGroups={{this.learnerGroups}}
              @canCopyWithLearners={{false}}
              @copyGroup={{perform this.copyGroup}}
              @sortBy={{this.sortGroupsBy}}
              @setSortBy={{set this "sortGroupsBy"}}
            />
          {{/if}}
        </div>
      </section>
      <section class="cohortmembers">
        <LearnerGroup::CohortUserManager
          @users={{this.usersForCohortManager}}
          @canUpdate={{@canUpdate}}
          @learnerGroupTitle={{this.learnerGroupTitle}}
          @topLevelGroupTitle={{this.topLevelGroupTitle}}
          @sortBy={{this.sortUsersBy}}
          @setSortBy={{@setSortUsersBy}}
          @addUserToGroup={{perform this.addUserToGroup}}
          @addUsersToGroup={{perform this.addUsersToGroup}}
        />
      </section>
    </section>
  </section>
{{/let}}