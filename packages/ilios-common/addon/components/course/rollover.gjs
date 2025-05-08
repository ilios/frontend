<div class="course-rollover">
  {{#if this.save.isRunning}}
    <WaitSaving @showProgress={{false}} />
  {{/if}}
  {{#let (unique-id) as |templateId|}}
    <div class="backtolink">
      <LinkTo @route="course" @model={{@course}}>
        {{t "general.backToTitle" title=@course.title}}
      </LinkTo>
    </div>
    <div class="rollover-form" {{scroll-into-view}}>
      <h3 class="title">
        {{t "general.courseRollover"}}
      </h3>
      <p class="rollover-summary">
        {{t "general.courseRolloverSummary"}}
      </p>
      <div class="item title">
        <label for="title-{{templateId}}">
          {{t "general.title"}}:
        </label>
        <input
          id="title-{{templateId}}"
          type="text"
          value={{this.title}}
          {{on "input" (pick "target.value" (set this "newTitle"))}}
          {{this.validations.attach "title"}}
          disabled={{this.save.isRunning}}
          placeholder={{t "general.courseTitlePlaceholder"}}
          data-test-title
        />
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
        />
      </div>
      <div class="item year-select">
        <label for="year-{{templateId}}">
          {{t "general.year"}}:
        </label>
        {{#if (is-array this.allCourses)}}
          <select id="year-{{templateId}}" data-test-year {{on "change" this.setSelectedYear}}>
            {{#each this.years as |year|}}
              <option
                disabled={{includes year this.unavailableYears}}
                value={{year}}
                selected={{is-equal year this.year}}
              >
                {{#if this.academicYearCrossesCalendarYearBoundaries}}
                  {{year}}
                  -
                  {{add year 1}}
                {{else}}
                  {{year}}
                {{/if}}
                {{#if (includes year this.unavailableYears)}}
                  ({{t "general.courseRolloverYearUnavailable"}})
                {{/if}}
              </option>
            {{/each}}
          </select>
        {{else}}
          <LoadingSpinner />
        {{/if}}
        <YupValidationMessage
          @description={{t "general.year"}}
          @validationErrors={{this.validations.errors.year}}
        />
      </div>
      <div class="advanced-options">
        <div class="item">
          <label>
            {{t "general.startDate"}}:
            <br />
            <small>
              ({{t "general.mustBeSameDayOfWeekAsCurrentStartDate"}})
            </small>
          </label>
          <DatePicker
            @value={{this.startDate}}
            @allowedWeekdays={{this.allowedWeekdays}}
            @minDate={{@course.startDate}}
            @onChange={{this.changeStartDate}}
          />
        </div>
        <div class="included">
          <label class="title" for="included-{{templateId}}">
            {{t "general.include"}}:
          </label>
          <div class="include">
            <input
              id="included-{{templateId}}"
              type="checkbox"
              checked={{not this.skipOfferings}}
              data-test-skip-offerings
              {{on "click" (toggle "skipOfferings" this)}}
            />
            <span>
              {{t "general.offerings"}}
            </span>
          </div>
        </div>
        <div class="cohorts">
          <span class="title">
            {{t "general.selectCohortsToAttach"}}:
          </span>
          <DetailCohortManager
            @selectedCohorts={{this.selectedCohorts}}
            @course={{@course}}
            @add={{this.addCohort}}
            @remove={{this.removeCohort}}
          />
        </div>
      </div>
      <div class="buttons">
        <button
          type="button"
          disabled={{if (or (not this.year) (includes this.year this.unavailableYears)) true}}
          class="done text"
          {{on "click" (perform this.save)}}
        >
          {{t "general.done"}}
        </button>
        <LinkTo @route="course" @model={{@course}}>
          <button class="cancel text" type="button">
            {{t "general.cancel"}}
          </button>
        </LinkTo>
      </div>
    </div>
  {{/let}}
</div>