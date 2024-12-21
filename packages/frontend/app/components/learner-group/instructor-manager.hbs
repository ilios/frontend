<div
  class="learner-group-instructor-manager"
  data-test-learner-group-instructor-manager
  ...attributes
>
  <div class="detail-header">
    <div class="title" data-test-title>
      {{t "general.manageDefaultInstructors"}}
    </div>
    <div class="actions">
      <button
        type="button"
        class="bigadd"
        {{on "click" (fn @save this.instructors this.instructorGroups)}}
        data-test-save
      >
        <FaIcon @icon="check" />
      </button>
      <button type="button" class="bigcancel" {{on "click" @cancel}} data-test-cancel>
        <FaIcon @icon="arrow-rotate-left" />
      </button>
    </div>
  </div>
  <div class="detail-content">
    {{#if this.instructors.length}}
      <h4>
        {{t "general.instructors"}}
      </h4>
      <ul class="removable-instructors">
        {{#each (sort-by "fullName" this.instructors) as |user|}}
          <li>
            <button
              class="link-button"
              type="button"
              {{on "click" (fn this.removeInstructor user)}}
              data-test-selected-instructor
            >
              <UserNameInfo @user={{user}} />
              <FaIcon @icon="xmark" class="remove" />
            </button>
          </li>
        {{/each}}
      </ul>
    {{/if}}
    {{#if this.instructorGroups.length}}
      <h4>
        {{t "general.instructorGroups"}}
      </h4>
      <div class="removable-instructor-groups">
        {{#each (sort-by "title" this.instructorGroups) as |instructorGroup|}}
          <div class="removable-instructor-group" data-test-selected-instructor-group>
            <button
              class="link-button"
              type="button"
              data-test-instructor-group-title
              {{on "click" (fn this.removeInstructorGroup instructorGroup)}}
            >
              <FaIcon @icon="users" />
              {{instructorGroup.title}}
              <FaIcon @icon="xmark" class="remove" />
            </button>
            <br />
            <LearnerGroup::InstructorGroupMembersList @instructorGroup={{instructorGroup}} />
          </div>
        {{/each}}
      </div>
    {{/if}}
    <UserSearch
      @addUser={{this.addInstructor}}
      @addInstructorGroup={{this.addInstructorGroup}}
      @currentlyActiveUsers={{this.instructors}}
      @availableInstructorGroups={{@availableInstructorGroups}}
      @currentlyActiveInstructorGroups={{this.instructorGroups}}
    />
  </div>
</div>