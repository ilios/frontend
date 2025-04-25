<div class="curriculum-inventory-report-rollover" data-test-curriculum-inventory-report-rollover>
  {{#unless this.load.isRunning}}
    <div class="rollover-form" {{scroll-into-view}}>
      <h3 class="title">
        {{t "general.curriculumInventoryReportRollover"}}
      </h3>
      <p class="rollover-summary">
        {{t "general.curriculumInventoryReportRolloverSummary"}}
      </p>
      <div class="item name" data-test-name>
        {{#let (unique-id) as |nameId|}}
          <label for={{nameId}}>
            {{t "general.name"}}:
          </label>
          <input
            id={{nameId}}
            type="text"
            value={{this.name}}
            disabled={{this.save.isRunning}}
            placeholder={{t "general.reportNamePlaceholder"}}
            {{on "input" (pick "target.value" this.changeName)}}
            {{on "keyup" this.saveOnEnter}}
            {{this.validations.attach "name"}}
          />
        {{/let}}
        <YupValidationMessage
          @description={{t "general.name"}}
          @validationErrors={{this.validations.errors.name}}
          data-test-name-validation-error-message
        />
      </div>
      <div class="item description" data-test-description>
        {{#let (unique-id) as |descriptionId|}}
          <label for={{descriptionId}}>
            {{t "general.description"}}:
          </label>
          <textarea
            id={{descriptionId}}
            {{on "input" (pick "target.value" (set this "description"))}}
            disabled={{this.save.isRunning}}
            placeholder={{t "general.reportDescriptionPlaceholder"}}
            {{this.validations.attach "description"}}
          >{{this.description}}</textarea>
          <YupValidationMessage
            @description={{t "general.description"}}
            @validationErrors={{this.validations.errors.description}}
            data-test-description-validation-error-message
          />
        {{/let}}
      </div>
      <div class="item years" data-test-years>
        {{#let (unique-id) as |yearId|}}
          <label for={{yearId}}>
            {{t "general.academicYear"}}:
          </label>
          <select
            id={{yearId}}
            disabled={{this.save.isRunning}}
            {{on "change" (pick "target.value" this.setSelectedYear)}}
          >
            {{#each this.years as |obj|}}
              <option
                value={{obj.year}}
                selected={{eq obj.year this.defaultYear}}
              >{{obj.title}}</option>
            {{/each}}
          </select>
        {{/let}}
      </div>
      <div class="item programs" data-test-programs>
        {{#if this.programsDataLoaded}}
          {{#let (unique-id) as |programId|}}
            <label for={{programId}}>
              {{t "general.program"}}:
            </label>
            {{#if (gt this.programs.length 1)}}
              <select
                id={{programId}}
                disabled={{this.save.isRunning}}
                {{on "change" (pick "target.value" this.changeProgram)}}
              >
                {{#each (sort-by "title" this.programs) as |program|}}
                  <option value={{program.id}} selected={{eq program this.defaultProgram}}>
                    {{program.title}}
                  </option>
                {{/each}}
              </select>
            {{else}}
              {{this.defaultProgram.title}}
            {{/if}}
          {{/let}}
        {{/if}}
      </div>
      <div class="buttons">
        <button
          type="button"
          class="done text"
          disabled={{or (not this.programsDataLoaded) this.save.isRunning}}
          {{on "click" (perform this.save)}}
          data-test-save
        >
          {{#if this.save.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{t "general.done"}}
          {{/if}}
        </button>
        <LinkTo @route="curriculum-inventory-report" @model={{@report}}>
          <button type="button" class="cancel text" data-test-cancel>
            {{t "general.cancel"}}
          </button>
        </LinkTo>
      </div>
    </div>
  {{/unless}}
</div>