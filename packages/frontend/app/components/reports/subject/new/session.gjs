<div class="new-subject-search" data-test-reports-subject-new-session>
  <p data-test-search>
    <label for="{{this.uniqueId}}-session-search">
      {{t "general.whichIs"}}
    </label>
    {{#if @currentId}}
      {{#let (load this.loadSession) as |p|}}
        {{#if p.isResolved}}
          {{#let p.value as |session|}}
            <button
              class="link-button"
              type="button"
              {{on "click" this.clear}}
              data-test-selected-session
            >
              {{session.course.year}}
              |&nbsp;
              {{session.title}}
              {{#if session.course.externalId}}
                [{{session.course.externalId}}] |
              {{/if}}
              {{session.course.title}}
              <FaIcon @icon="xmark" class="remove" />
            </button>
          {{/let}}
        {{else}}
          <LoadingSpinner />
        {{/if}}
      {{/let}}
    {{else}}
      <Reports::Subject::New::Search::Input
        id="{{this.uniqueId}}-session-search"
        @search={{perform this.search}}
        @searchIsRunning={{this.search.isRunning}}
        @searchIsIdle={{this.search.isIdle}}
        @searchReturned={{is-array this.sessions}}
        @results={{this.sortedSessions}}
        as |session|
      >
        <button class="link-button" type="button" {{on "click" (fn @changeId session.id)}}>
          {{session.course.year}}
          |&nbsp;
          {{session.title}}
          {{#if session.course.externalId}}
            [{{session.course.externalId}}] |
          {{/if}}
          {{session.course.title}}
        </button>

      </Reports::Subject::New::Search::Input>
    {{/if}}
  </p>
</div>