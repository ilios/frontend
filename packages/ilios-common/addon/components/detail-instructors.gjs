<section class="detail-instructors" data-test-detail-instructors>
  <div class="detail-instructors-header">
    <div class="title" data-test-title>
      {{#if this.isManaging}}
        <span class="detail-specific-title">
          {{t "general.instructorsManageTitle"}}
        </span>
      {{else}}
        {{t
          "general.instructorsAndInstructorGroupsWithCount"
          instructorCount=this.instructorCount
          instructorGroupCount=this.instructorGroupCount
        }}
      {{/if}}
    </div>
    <div class="actions">
      {{#if this.isManaging}}
        <button class="bigadd" type="button" {{on "click" (perform this.save)}} data-test-save>
          <FaIcon @icon="check" />
        </button>
        <button class="bigcancel" type="button" {{on "click" this.cancel}} data-test-cancel>
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      {{else if @editable}}
        <button type="button" {{on "click" (perform this.manage)}} data-test-manage>
          {{t "general.instructorsManageTitle"}}
        </button>
      {{/if}}
    </div>
  </div>
  <div class="detail-instructors-content">
    {{#if this.isManaging}}
      <InstructorSelectionManager
        @addInstructor={{this.addInstructorToBuffer}}
        @addInstructorGroup={{this.addInstructorGroupToBuffer}}
        @removeInstructor={{this.removeInstructorFromBuffer}}
        @removeInstructorGroup={{this.removeInstructorGroupFromBuffer}}
        @availableInstructorGroups={{this.availableInstructorGroups}}
        @instructorGroups={{this.instructorGroupBuffer}}
        @instructors={{this.instructorBuffer}}
        @showDefaultNotLoaded={{false}}
      />
    {{else}}
      {{#if this.instructorCount}}
        <SelectedInstructors
          @instructors={{this.selectedIlmInstructors}}
          @isManaging={{false}}
          @showDefaultNotLoaded={{false}}
          class="display-selected-instructors"
        />
      {{/if}}
      {{#if this.instructorGroupCount}}
        <SelectedInstructorGroups
          @instructorGroups={{this.selectedIlmInstructorGroups}}
          @isManaging={{false}}
          @showDefaultNotLoaded={{false}}
          class="display-selected-instructor-groups"
        />
      {{/if}}
    {{/if}}
  </div>
</section>