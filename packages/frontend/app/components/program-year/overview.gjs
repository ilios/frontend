<div class="programyear-overview" data-test-program-year-overview ...attributes>
  <div class="programyear-overview-header">
    <h5 data-test-title>
      {{t "general.overview"}}
    </h5>
    <div class="programyear-overview-actions" data-test-actions>
      <LinkTo
        @route="program-year-visualize-objectives"
        @model={{@programYear}}
        title={{t "general.programYearVisualizations"}}
        data-test-go-to-visualizations
      >
        <FaIcon @icon="chart-column" />
      </LinkTo>
    </div>
  </div>
</div>