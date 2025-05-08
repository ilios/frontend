{{#if this.reportTitleData.isResolved}}
  <div class="download" data-test-subject-report-download>
    {{#if @message}}
      <p data-test-message>{{@message}}</p>
    {{/if}}
    <button
      type="button"
      disabled={{not @readyToDownload}}
      {{on "click" (perform this.downloadReport)}}
      data-test-button
    >
      {{#if this.finishedBuildingReport}}
        <FaIcon @icon="check" />
      {{else}}
        <FaIcon @icon="download" />
      {{/if}}
      {{t "general.downloadResults"}}
    </button>
  </div>
{{/if}}