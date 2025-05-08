<section
  class="curriculum-inventory-report-overview"
  data-test-curriculum-inventory-report-overview
  ...attributes
>
  {{#let (unique-id) as |templateId|}}
    <div class="report-overview-header">
      <div class="title" data-test-title>
        {{t "general.overview"}}
      </div>
      <div class="report-overview-actions">
        <LinkTo
          @route="verification-preview"
          @model={{@report}}
          class="verification-preview"
          data-test-transition-to-verification-preview
        >
          <FaIcon
            @icon="table"
            @fixedWidth={{true}}
            @title={{t "general.verificationPreviewFor" name=@report.name}}
          />
        </LinkTo>
        {{#if this.showRollover}}
          <button
            class="link-button rollover"
            type="button"
            aria-label={{t "general.curriculumInventoryReportRollover"}}
            {{on "click" this.transitionToRollover}}
            data-test-transition-to-rollover
          >
            <FaIcon
              @icon="shuffle"
              @fixedWidth={{true}}
              @title={{t "general.curriculumInventoryReportRollover"}}
            />
          </button>
        {{/if}}
      </div>
    </div>
    <div class="curriculum-inventory-report-overview-content">
      <div class="block start-date" data-test-start-date>
        <label>
          {{t "general.startDate"}}:
        </label>
        <span>
          {{#if @canUpdate}}
            <EditableField
              @value={{format-date @report.startDate day="2-digit" month="2-digit" year="numeric"}}
              @save={{perform this.changeStartDate}}
              @close={{this.revertStartDateChanges}}
            >
              <DatePicker
                @value={{this.startDate}}
                @onChange={{set this "startDate"}}
                {{this.validations.attach "startDate"}}
                data-test-start-date-picker
              />
            </EditableField>
            <YupValidationMessage
              @description={{t "general.startDate"}}
              @validationErrors={{this.validations.errors.startDate}}
              data-test-start-date-validation-error-message
            />
          {{else}}
            {{format-date @report.startDate day="2-digit" month="2-digit" year="numeric"}}
          {{/if}}
        </span>
      </div>
      <div class="block end-date" data-test-end-date>
        <label>
          {{t "general.endDate"}}:
        </label>
        <span>
          {{#if @canUpdate}}
            <EditableField
              @value={{format-date @report.endDate day="2-digit" month="2-digit" year="numeric"}}
              @save={{perform this.changeEndDate}}
              @close={{this.revertEndDateChanges}}
            >
              <DatePicker
                @value={{this.endDate}}
                @onChange={{set this "endDate"}}
                {{this.validations.attach "endDate"}}
                data-test-end-date-picker
              />
            </EditableField>
            <YupValidationMessage
              @description={{t "general.endDate"}}
              @validationErrors={{this.validations.errors.endDate}}
              data-test-end-date-validation-error-message
            />
          {{else}}
            {{format-date @report.endDate day="2-digit" month="2-digit" year="numeric"}}
          {{/if}}
        </span>
      </div>
      <div class="block academic-year" data-test-academic-year>
        <label for="year-{{templateId}}">
          {{t "general.academicYear"}}:
        </label>
        {{#if this.linkedCoursesLoaded}}
          {{#if (and @canUpdate (not this.hasLinkedCourses))}}
            <EditableField
              @value={{this.yearLabel}}
              @save={{perform this.changeYear}}
              @close={{this.revertYearChanges}}
            >
              <select
                id="year-{{templateId}}"
                {{on "change" (pick "target.value" (set this "year"))}}
              >
                {{#each this.yearOptions as |obj|}}
                  <option value={{obj.id}} selected={{eq obj.id this.year}}>{{obj.title}}</option>
                {{/each}}
              </select>
            </EditableField>
          {{else}}
            <span>
              {{this.yearLabel}}
            </span>
          {{/if}}
        {{/if}}
      </div>
      <div class="block program" data-test-program>
        <label>
          {{t "general.program"}}:
        </label>
        <span>
          {{@report.program.title}}
          {{#if @report.program.shortTitle}}
            ({{@report.program.shortTitle}})
          {{/if}}
        </span>
      </div>
      <div class="description" data-test-description>
        <label for="description-{{templateId}}">
          {{t "general.description"}}:
        </label>
        <span>
          {{#if @canUpdate}}
            <EditableField
              @value={{this.description}}
              @save={{perform this.changeDescription}}
              @close={{this.revertDescriptionChanges}}
              @clickPrompt={{if this.description this.description (t "general.clickToEdit")}}
              @closeOnEscape={{true}}
              as |isSaving|
            >
              <textarea
                id="description-{{templateId}}"
                value={{this.description}}
                disabled={{this.isSaving}}
                {{on "input" (pick "target.value" (set this "description"))}}
                {{this.validations.attach "description"}}
                placeholder={{t "general.reportDescriptionPlaceholder"}}
              >
                {{this.description}}
              </textarea>
            </EditableField>
            <YupValidationMessage
              @description={{t "general.description"}}
              @validationErrors={{this.validations.errors.description}}
              data-test-description-validation-error-message
            />
          {{else}}
            {{this.description}}
          {{/if}}
        </span>
      </div>
    </div>
  {{/let}}
</section>