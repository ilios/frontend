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
  @readyToDownload={{this.allProgramsData.isResolved}}
  @resultsLength={{this.allPrograms.length}}
/>
<div data-test-reports-subject-program>
  {{#if this.allProgramsData.isResolved}}
    <ul class="report-results{{if this.reportResultsExceedMax ' limited'}}" data-test-results>
      {{#each this.limitedPrograms as |program|}}
        <li>
          {{#if this.showSchool}}
            <span data-test-school>
              {{program.school.title}}
            </span>
          {{/if}}
          <span data-test-title>
            {{#if this.canView}}
              <LinkTo @route="program" @model={{program.id}}>
                {{program.title}}
              </LinkTo>
            {{else}}
              {{program.title}}
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