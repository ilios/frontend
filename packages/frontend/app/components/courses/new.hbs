{{#let (unique-id) as |templateId|}}
  <div class="courses-new" data-test-courses-new>
    {{#unless this.load.isRunning}}
      <h4>
        {{t "general.newCourse"}}
      </h4>
      <div>
        <div class="item">
          <label for="title-{{templateId}}">
            {{t "general.title"}}:
          </label>
          <input
            id="title-{{templateId}}"
            class="course-title"
            disabled={{this.saveCourse.isRunning}}
            placeholder={{t "general.courseTitlePlaceholder"}}
            type="text"
            value={{this.title}}
            {{on "keyup" this.keyboard}}
            {{on "input" (pick "target.value" (set this "title"))}}
            {{this.validations.attach "title"}}
            data-test-title
          />
          <YupValidationMessage
            @description={{t "general.title"}}
            @validationErrors={{this.validations.errors.title}}
            data-test-title-validation-error-message
          />
        </div>
        <div class="item">
          <label for="year-{{templateId}}">
            {{t "general.academicYear"}}:
          </label>
          {{#if this.academicYearCrossesCalendarYearBoundariesData.isResolved}}
            <select
              id="year-{{templateId}}"
              data-test-year
              {{on "change" (pick "target.value" this.setYear)}}
            >
              <option disabled="" selected={{is-empty this.selectedYear}} value="">
                {{t "general.selectAcademicYear"}}
              </option>
              {{#each this.years as |year|}}
                <option selected={{eq year this.selectedYear}} value={{year}}>
                  {{#if this.academicYearCrossesCalendarYearBoundaries}}
                    {{year}}
                    -
                    {{add year 1}}
                  {{else}}
                    {{year}}
                  {{/if}}
                </option>
              {{/each}}
            </select>
          {{/if}}
        </div>
        <div class="buttons">
          <button
            type="button"
            class="done text"
            disabled={{not this.selectedYear}}
            data-test-save
            {{on "click" (perform this.saveCourse)}}
          >
            {{#if this.saveCourse.isRunning}}
              <LoadingSpinner />
            {{else}}
              {{t "general.done"}}
            {{/if}}
          </button>
          <button type="button" class="cancel text" data-test-cancel {{on "click" @cancel}}>
            {{t "general.cancel"}}
          </button>
        </div>
      </div>
    {{/unless}}
  </div>
{{/let}}