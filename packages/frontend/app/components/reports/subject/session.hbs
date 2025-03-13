<Reports::SubjectHeader
  @report={{@report}}
  @school={{@school}}
  @subject={{@subject}}
  @prepositionalObject={{@prepositionalObject}}
  @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
  @year={{@year}}
  @changeYear={{@changeYear}}
  @showYearFilter={{and
    (not-eq @prepositionalObject "course")
    (not-eq @prepositionalObject "academic year")
  }}
  @description={{@description}}
  @fetchDownloadData={{this.fetchDownloadData}}
  @readyToDownload={{true}}
  @resultsLength={{this.resultsLengthDisplay}}
/>
<div data-test-reports-subject-session>
  {{#if this.allSessionsData.isResolved}}
    <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
      {{#each this.limitedSessions as |obj|}}
        <li>
          {{#if this.showYear}}
            <span data-test-year>
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{obj.year}}
                -
                {{add obj.year 1}}
              {{else}}
                {{obj.year}}
              {{/if}}
            </span>
          {{/if}}
          <span data-test-course-title>
            {{#if this.canViewCourse}}
              <LinkTo @route="course" @model={{obj.courseId}}>
                {{obj.courseTitle}}:
              </LinkTo>
            {{else}}
              {{obj.courseTitle}}:
            {{/if}}
          </span>

          <span data-test-session-title>
            {{#if this.canViewCourse}}
              <LinkTo @route="session" @models={{array obj.courseId obj.id}}>
                {{obj.title}}
              </LinkTo>
            {{else}}
              {{obj.title}}
            {{/if}}
          </span>
        </li>
      {{else}}
        <li>{{t "general.none"}}</li>
      {{/each}}
    </ul>
    {{#if this.reportResultsExceedMax}}
      <Reports::SubjectDownload
        @report={{@report}}
        @subject={{@subject}}
        @prepositionalObject={{@prepositionalObject}}
        @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
        @school={{@school}}
        @fetchDownloadData={{this.fetchDownloadData}}
        @readyToDownload={{true}}
        @message={{t "general.reportResultsExceedMax" resultsLengthMax=this.resultsLengthMax}}
      />
    {{/if}}
  {{else}}
    <LoadingSpinner />
  {{/if}}
</div>