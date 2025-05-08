<div class="selected-instructors" data-test-selected-instructors ...attributes>
  <label class="heading" data-test-heading>
    {{t "general.selectedInstructors"}}:
    {{#if @showDefaultNotLoaded}}
      <span class="label-description">({{t "general.defaultNotLoaded"}})</span>
    {{/if}}
  </label>
  {{#if @instructors.length}}
    <ul class="instructors-list" data-test-selected-instructors-list>
      {{#each (sort-by "fullName" @instructors) as |user|}}
        {{#if @isManaging}}
          <li>
            <button type="button" {{on "click" (fn @remove user)}}>
              <UserNameInfo @user={{user}} />
              <FaIcon @icon="xmark" class="remove" />
            </button>
          </li>
        {{else}}
          <li>
            <UserNameInfo @user={{user}} />
          </li>
        {{/if}}
      {{/each}}
    </ul>
  {{else}}
    <div data-test-no-selected-instructors>
      {{t "general.none"}}
    </div>
  {{/if}}
</div>