<div class="programyear-header" data-test-programyear-header ...attributes>
  <div class="backtolink">
    <LinkTo @route="program" data-test-back-to-program>
      {{t "general.backToProgramYears"}}
    </LinkTo>
  </div>
  <header>
    <div class="title">
      {{#if @programYear.locked}}
        <FaIcon @icon="lock" data-test-lock />
      {{/if}}
      {{#if @programYear}}
        <h4 data-test-matriculation-year>
          {{t "general.matriculationYear"}}
          {{#if this.academicYearCrossesCalendarYearBoundaries}}
            {{@programYear.startYear}}
            -
            {{add @programYear.startYear 1}}
          {{else}}
            {{@programYear.startYear}}
          {{/if}}
        </h4>
        <h5 data-test-cohort>
          {{#if @programYear.cohort.title}}
            ({{@programYear.cohort.title}})
          {{else}}
            ({{t "general.classOf" year=@programYear.classOfYear}})
          {{/if}}
        </h5>
      {{/if}}
    </div>
  </header>
</div>