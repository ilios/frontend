<div class="selected-learners" data-test-selected-learners ...attributes>
  <label data-test-heading>
    {{t "general.selectedLearners"}}:
  </label>
  {{#if @learners.length}}
    <ul class="learners-list" data-test-selected-learners-list>
      {{#each (sort-by "fullName" @learners) as |user|}}
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
    <div data-test-no-selected-learners>
      {{t "general.none"}}
    </div>
  {{/if}}
</div>