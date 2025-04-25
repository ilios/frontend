{{! template-lint-disable attribute-indentation }}
<div class="curriculum-inventory-new-report" data-test-curriculum-inventory-new-report>
  {{#let (unique-id) as |templateId|}}
    <h4>
      {{t "general.newCurriculumInventoryReport"}}
    </h4>
    <div class="form">
      <div class="item" data-test-name>
        <label for="name-{{templateId}}">
          {{t "general.name"}}:
        </label>
        <input
          id="name-{{templateId}}"
          type="text"
          value={{this.name}}
          disabled={{this.save.isRunning}}
          placeholder={{t "general.reportNamePlaceholder"}}
          {{on "keyup" (perform this.keyboard)}}
          {{on "input" (pick "target.value" (set this "name"))}}
          {{this.validations.attach "name"}}
        />
        <YupValidationMessage
          @description={{t "general.name"}}
          @validationErrors={{this.validations.errors.name}}
          data-test-name-validation-error-message
        />
      </div>
      <div class="item" data-test-description>
        <label for="description-{{templateId}}">
          {{t "general.description"}}:
        </label>
        <textarea
          id="description-{{templateId}}"
          disabled={{this.save.isRunning}}
          placeholder={{t "general.reportDescriptionPlaceholder"}}
          {{on "input" (pick "target.value" (set this "description"))}}
          {{this.validations.attach "description"}}
        >{{this.description}}</textarea>
        <YupValidationMessage
          @description={{t "general.description"}}
          @validationErrors={{this.validations.errors.description}}
          data-test-description-validation-error-message
        />
      </div>
      <div class="item" data-test-program-title>
        <label>
          {{t "general.program"}}:
        </label>
        <span>
          {{@currentProgram.title}}
        </span>
      </div>
      <div class="item" data-test-academic-year>
        <label for="academicYear-{{templateId}}">
          {{t "general.academicYear"}}:
        </label>
        <select
          id="academicYear-{{templateId}}"
          disabled={{this.save.isRunning}}
          {{on "change" (pick "target.value" this.setSelectedYear)}}
        >
          {{#each this.years as |year|}}
            <option
              value={{year.id}}
              selected={{eq year.id this.selectedYear}}
            >{{year.title}}</option>
          {{/each}}
        </select>
      </div>
      <div class="buttons">
        <button type="button" class="done text" {{on "click" (perform this.save)}} data-test-save>
          {{#if this.save.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{t "general.done"}}
          {{/if}}
        </button>
        <button type="button" class="cancel text" {{on "click" @cancel}} data-test-cancel>
          {{t "general.cancel"}}
        </button>
      </div>
    </div>
  {{/let}}
</div>