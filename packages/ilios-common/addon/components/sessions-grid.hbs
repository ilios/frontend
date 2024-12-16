<div class="sessions-grid" data-test-sessions-grid>
  {{#each this.sortedSessions as |session|}}
    <div
      class="{{if (includes session.id @expandedSessionIds) 'is-expanded' 'not-expanded'}} session"
      data-test-expanded-session={{includes session.id @expandedSessionIds}}
      data-test-session
    >
      <SessionsGridRow
        @session={{session}}
        @confirmDelete={{this.confirmDelete}}
        @closeSession={{@closeSession}}
        @expandSession={{this.expandSession}}
        @expandedSessionIds={{@expandedSessionIds}}
      />
      {{#if (includes session.id this.confirmDeleteSessionIds)}}
        <div class="confirm-removal" data-test-confirm-removal>
          {{t "general.confirmSessionRemoval"}}
          <div class="confirm-buttons">
            <button
              class="cancel"
              type="button"
              data-test-yes
              disabled={{this.removeSession.isRunning}}
              {{on "click" (perform this.removeSession session)}}
            >
              {{#if this.removeSession.isRunning}}
                <LoadingSpinner />
              {{else}}
                {{t "general.yes"}}
              {{/if}}
            </button>
            <button class="done" type="button" {{on "click" (fn this.cancelDelete session.id)}}>
              {{t "general.cancel"}}
            </button>
          </div>
        </div>
      {{/if}}
      {{#if (includes session.id @expandedSessionIds)}}
        <SessionsGridLastUpdated @session={{session}} />
        <SessionsGridOfferingTable
          @session={{session}}
          @headerIsLocked={{@headerIsLocked}}
          @setHeaderLockedStatus={{@setHeaderLockedStatus}}
        />
      {{/if}}
    </div>
  {{else}}
    <div class="no-results" data-test-no-results>{{t "general.noResultsFound"}}</div>
  {{/each}}
</div>