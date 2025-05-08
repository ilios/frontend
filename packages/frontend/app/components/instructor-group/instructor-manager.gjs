<section
  class="instructor-group-instructor-manager"
  data-test-instructor-group-instructor-manager
  ...attributes
>
  <div class="selected-instructors" data-test-selected-instructors>
    <label class="sub-title">{{t "general.selectedInstructors"}}:</label>
    {{#if @instructors.length}}
      <ul class="instructor-list">
        {{#each (sort-by "fullName" @instructors) as |user|}}
          <li data-test-selected-instructor>
            <button type="button" {{on "click" (fn @remove user)}} data-test-remove>
              <UserNameInfo @user={{user}} />
              <FaIcon @icon="xmark" class="remove" />
            </button>
          </li>
        {{/each}}
      </ul>
    {{else}}
      <div data-test-no-selected-instructors>
        {{t "general.none"}}
      </div>
    {{/if}}
  </div>
  <div class="available-instructors" data-test-available-instructors>
    <label class="sub-title">{{t "general.availableInstructors"}}:</label>
    <UserSearch
      @addUser={{@add}}
      @currentlyActiveUsers={{@instructors}}
      @placeholder={{t "general.findInstructor"}}
    />
  </div>
</section>