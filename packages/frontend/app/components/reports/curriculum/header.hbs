<div class="reports-curriculum-header" data-test-reports-curriculum-header>
  <div class="run">
    <p data-test-run-summary>
      {{#if @countSelectedCourses}}
        {{#if @showReportResults}}
          {{t "general.run"}}
          {{this.selectedReport.label}}
        {{else}}
          <label data-test-report-selector>
            {{t "general.run"}}
            <select {{on "change" this.changeSelectedReport}}>
              {{#each this.reportList as |report|}}
                <option
                  value={{report.value}}
                  selected={{eq report.value this.selectedReport.value}}
                >
                  {{report.label}}
                </option>
              {{/each}}
            </select>
          </label>
        {{/if}}
        {{this.selectedReport.summary}}
      {{else}}
        {{t "general.selectCoursesToRunReport"}}
      {{/if}}
    </p>
  </div>
  <div class="input-buttons">
    {{#if @countSelectedCourses}}
      <CopyButton
        @clipboardText={{this.reportUrl}}
        @success={{perform this.textCopied}}
        aria-label={{t "general.copyCurriculumReportUrl"}}
        id={{this.copyButtonId}}
        data-test-copy-url
        {{mouse-hover-toggle (set this "showCopyTooltip")}}
      >
        <FaIcon @icon="copy" />
      </CopyButton>
      {{#if this.showCopyTooltip}}
        <IliosTooltip
          @target={{this.copyButtonElement}}
          @options={{this.popperOptions}}
          class="ics-feed-tooltip"
        >
          {{t "general.copyCurriculumReportUrl"}}
        </IliosTooltip>
      {{/if}}
    {{/if}}
    {{#if @showReportResults}}
      {{#if @loading}}
        <button type="button" class="done text">
          <FaIcon @icon="spinner" @spin={{true}} />
        </button>
      {{else}}
        <button type="button" {{on "click" @download}} data-test-download>
          {{#if @finished}}
            <FaIcon @icon="check" />
          {{else}}
            <FaIcon @icon="download" />
          {{/if}}
          {{t "general.downloadResults"}}
        </button>
      {{/if}}
      <button type="button" class="cancel text" {{on "click" @close}} data-test-close>
        {{t "general.close"}}
      </button>
    {{else}}
      <button
        type="button"
        class="done text"
        {{on "click" @runReport}}
        disabled={{not @countSelectedCourses}}
        id={{this.runButtonId}}
        {{mouse-hover-toggle (set this "showRunTooltip")}}
        data-test-run
      >
        <FaIcon @icon="play" @title={{t "general.runReport"}} />
      </button>
      {{#if this.showRunTooltip}}
        <IliosTooltip
          @target={{this.runButtonElement}}
          @options={{this.popperOptions}}
          class="ics-feed-tooltip"
        >
          {{t "general.runReport"}}
        </IliosTooltip>
      {{/if}}
    {{/if}}
  </div>
</div>