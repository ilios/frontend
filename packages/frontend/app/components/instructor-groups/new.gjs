{{#let (unique-id) as |templateId|}}
  <div class="new-instructor-group" data-test-instructor-groups-new>
    <h4>
      {{t "general.newInstructorGroup"}}
    </h4>
    <div class="form">
      <div class="item title" data-test-title>
        <label for="title-{{templateId}}">
          {{t "general.title"}}:
        </label>
        <input
          id="title-{{templateId}}"
          {{focus}}
          type="text"
          disabled={{this.save.isRunning}}
          placeholder={{t "general.instructorGroupTitlePlaceholder"}}
          value={{this.title}}
          {{on "keyup" this.keyboard}}
          {{on "input" (pick "target.value" (set this "title"))}}
          {{this.validations.attach "title"}}
        />
        <YupValidationMessage
          @description={{t "general.title"}}
          @validationErrors={{this.validations.errors.title}}
          data-test-title-validation-error-message
        />
      </div>
      <div class="buttons">
        <button type="button" class="done text" {{on "click" (perform this.save)}} data-test-done>
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
  </div>
{{/let}}