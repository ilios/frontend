<div class="user-search" data-test-user-search>
  <SearchBox
    placeholder={{@placeholder}}
    @search={{perform this.search}}
    @clear={{perform this.search}}
  />
  {{#if this.search.isRunning}}
    <ul class="results" data-test-results>
      <li>
        {{t "general.currentlySearchingPrompt"}}
      </li>
    </ul>
  {{/if}}
  {{#if (and this.search.isIdle this.showMoreInputPrompt)}}
    <ul class="results" data-test-results>
      <li>
        {{t "general.moreInputRequiredPrompt"}}
      </li>
    </ul>
  {{/if}}
  {{#if (and this.search.isIdle (gt this.sortedResults.length 0))}}
    <ul class="results" data-test-results>
      <li class="results-count" data-test-results-count>
        {{this.sortedResults.length}}
        {{t "general.results"}}
      </li>
      {{#each this.sortedResults as |result|}}
        {{#if (eq result.type "user")}}
          <UserSearchResultUser
            @user={{result.user}}
            @addUser={{this.addUser}}
            @currentlyActiveUsers={{this.currentlyActiveUsers}}
          />
        {{else}}
          <UserSearchResultInstructorGroup
            @group={{result.group}}
            @addInstructorGroup={{this.addInstructorGroup}}
            @currentlyActiveInstructorGroups={{this.currentlyActiveInstructorGroups}}
          />
        {{/if}}
      {{/each}}
    </ul>
  {{else if this.searchReturned}}
    <ul class="results" data-test-results>
      <li>
        {{t "general.noSearchResultsPrompt"}}
      </li>
    </ul>
  {{/if}}
</div>