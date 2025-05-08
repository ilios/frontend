<Reports::SubjectHeader
  @report={{@report}}
  @subject={{@subject}}
  @prepositionalObject={{@prepositionalObject}}
  @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
  @school={{@school}}
  @changeYear={{@changeYear}}
  @year={{@year}}
  @description={{@description}}
  @showYearFilter={{not-eq @prepositionalObject "academic year"}}
  @fetchDownloadData={{this.fetchDownloadData}}
  @readyToDownload={{this.allCoursesData.isResolved}}
  @resultsLength={{this.resultsLengthDisplay}}
/>
<div data-test-reports-subject-course>
  {{#if this.allCoursesData.isResolved}}
    <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
      {{#each this.limitedCourses as |course|}}
        <li>
          {{#if this.showYear}}
            <span data-test-year>
              {{course.year}}
            </span>
          {{/if}}
          <span data-test-title>
            {{#if this.canViewCourse}}
              <LinkTo @route="course" @model={{course.id}}>
                {{course.title}}
                {{#if course.externalId}}
                  ({{course.externalId}})
                {{/if}}
              </LinkTo>
            {{else}}
              {{course.title}}
              {{#if course.externalId}}
                ({{course.externalId}})
              {{/if}}
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