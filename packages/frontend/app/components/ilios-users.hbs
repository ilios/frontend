<div class="ilios-users" data-test-ilios-users ...attributes>
  <div class="filters" data-test-filters>
    <div class="filter user-search">
      <input
        autocomplete="name"
        type="search"
        value={{@query}}
        {{on "input" (pick "target.value" this.setQuery)}}
        placeholder={{t "general.searchUsers"}}
        aria-label={{t "general.searchUsers"}}
      />
    </div>
  </div>
  <section class="users">
    <div class="header" data-test-header>
      <span class="title" data-test-title>
        {{t "general.users"}}
      </span>
      <div class="actions">
        {{#if (or @showNewUserForm @showBulkNewUserForm)}}
          <button
            type="button"
            {{on
              "click"
              (if
                @showNewUserForm (fn @setShowNewUserForm false) (fn @setShowBulkNewUserForm false)
              )
            }}
            data-test-collapse
          >
            <FaIcon @icon="minus" />
          </button>
        {{else}}
          <button
            type="button"
            {{on "click" (fn @setShowNewUserForm true)}}
            data-test-show-new-user-form
          >
            {{t "general.create"}}
          </button>
          {{#if (not-eq this.userSearchType "ldap")}}
            <button
              type="button"
              {{on "click" (fn @setShowBulkNewUserForm true)}}
              data-test-show-bulk-new-user-form
            >
              {{t "general.createBulk"}}
            </button>
          {{/if}}
        {{/if}}
      </div>
    </div>
    <section class="new">
      {{#if (or @showNewUserForm @showBulkNewUserForm)}}
        {{#let (load this.loadAllSchoolCohortsPromise) as |p|}}
          {{#if p.isResolved}}
            {{#if @showNewUserForm}}
              <this.newUserComponent
                @close={{fn @setShowNewUserForm false}}
                @transitionToUser={{@transitionToUser}}
                @searchTerms={{@searchTerms}}
                @setSearchTerms={{@setSearchTerms}}
              />
            {{/if}}
            {{#if @showBulkNewUserForm}}
              <BulkNewUsers @close={{fn @setShowBulkNewUserForm false}} />
            {{/if}}
          {{else}}
            <LoadingSpinner />
          {{/if}}
        {{/let}}
      {{/if}}
    </section>
    {{#if this.searchForUsers.lastSuccessful}}
      <div data-test-top-paged-list-controls>
        <PagedlistControls
          @total={{this.searchForUsers.lastSuccessful.value.length}}
          @offset={{@offset}}
          @limit={{@limit}}
          @limitless={{true}}
          @setOffset={{this.setOffset}}
          @setLimit={{this.setLimit}}
        />
      </div>
      <div class="list">
        {{#if this.searchForUsers.isRunning}}
          <LoadingSpinner />
        {{else}}
          {{#if (gt this.searchForUsers.lastSuccessful.value.length 0)}}
            <UserList @users={{this.searchForUsers.lastSuccessful.value}} />
          {{else}}
            <span class="no-results">
              {{t "general.noResultsFound"}}
            </span>
          {{/if}}
        {{/if}}
      </div>
      <div data-test-bottom-paged-list-controls>
        <PagedlistControls
          @total={{this.searchForUsers.lastSuccessful.value.length}}
          @offset={{@offset}}
          @limit={{@limit}}
          @limitless={{true}}
          @setOffset={{this.setOffset}}
          @setLimit={{this.setLimit}}
        />
      </div>
    {{else}}
      <LoadingSpinner />
    {{/if}}
  </section>
</div>