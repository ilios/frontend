<div class="reports-subject-header" data-test-reports-subject-header>
  <h2 data-test-report-title>
    {{#if (and @report this.reportTitleData.isResolved)}}
      <EditableField
        data-test-title
        @value={{this.reportTitle}}
        @save={{perform this.changeTitle}}
        @close={{this.revertTitleChanges}}
        @saveOnEnter={{true}}
        @showIcon={{false}}
        @closeOnEscape={{true}}
        as |isSaving|
      >
        <input
          aria-label={{t "general.reportTitle"}}
          type="text"
          value={{this.reportTitle}}
          placeholder={{this.reportTitleData.value}}
          disabled={{isSaving}}
          {{on "input" (pick "target.value" (set this "title"))}}
          {{this.validations.attach "title"}}
        />
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
          data-test-title-validation-error-message
        />
      </EditableField>
    {{/if}}
  </h2>
  <Reports::SubjectDownload
    @report={{@report}}
    @subject={{@subject}}
    @prepositionalObject={{@prepositionalObject}}
    @prepositionalObjectTableRowId={{@prepositionalObjectTableRowId}}
    @school={{@school}}
    @fetchDownloadData={{@fetchDownloadData}}
    @readyToDownload={{@readyToDownload}}
  />
  {{#if @showYearFilter}}
    <Reports::SubjectYearFilter @selectedYear={{@year}} @changeYear={{@changeYear}} />
  {{/if}}
  <Reports::SubjectDescription @description={{@description}} @resultsLength={{@resultsLength}} />
</div>