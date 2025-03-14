<Reports::SubjectHeader
  @report={{@report}}
  @school={{@school}}
  @subject={{@subject}}
  @prepositionalObject={{@prepositionalObject}}
  @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
  @year={{@year}}
  @showYearFilter={{false}}
  @description={{@description}}
  @fetchDownloadData={{this.fetchDownloadData}}
  @readyToDownload={{this.allProgramYearsData.isResolved}}
  @resultsLength={{this.allProgramYears.length}}
/>
<div data-test-reports-subject-program-year>
  {{#if this.allProgramYearsData.isResolved}}
    <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
      {{#each this.limitedProgramYears as |obj|}}
        <li>
          {{#if this.showSchool}}
            <span data-test-school>
              {{obj.program.school.title}}
              -
            </span>
          {{/if}}
          <span data-test-program>
            {{obj.program.title}}:
          </span>
          <span data-test-title>
            {{#if this.canView}}
              <LinkTo @route="program-year" @models={{array obj.program.id obj.id}}>
                {{obj.classOfYear}}
              </LinkTo>
            {{else}}
              {{obj.classOfYear}}
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