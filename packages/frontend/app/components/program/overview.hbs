<div class="program-overview" data-test-program-overview ...attributes>
  <h2>
    {{t "general.overview"}}
  </h2>
  <div class="program-overview-content">
    <div class="block programtitleshort" data-test-short-title>
      <label for={{concat this.id "short-title"}}>
        {{t "general.programTitleShort"}}:
      </label>
      <span data-test-value>
        {{#if @canUpdate}}
          <EditableField
            @value={{this.shortTitle}}
            @save={{perform this.changeShortTitle}}
            @close={{set this "duration" @program.duration}}
            @saveOnEnter={{true}}
            @clickPrompt={{t "general.clickToEdit"}}
            @closeOnEscape={{true}}
            as |isSaving|
          >
            <input
              id={{concat this.id "short-title"}}
              type="text"
              value={{this.shortTitle}}
              {{on "input" (pick "target.value" (set this "shortTitle"))}}
              {{this.validations.attach "shortTitle"}}
              disabled={{isSaving}}
            />
          </EditableField>
          <YupValidationMessage
            @validationErrors={{this.validations.errors.shortTitle}}
            data-test-title-validation-error-message
          />
        {{else}}
          {{this.shortTitle}}
        {{/if}}
      </span>
    </div>
    <div class="block programduration" data-test-duration>
      <label for={{concat this.id "duration"}}>
        {{t "general.durationInYears"}}:
      </label>
      <span data-test-value>
        {{#if @canUpdate}}
          <EditableField
            @value={{this.duration}}
            @save={{perform this.changeDuration}}
            @close={{set this "duration" @program.duration}}
          >
            <select id={{concat this.id "duration"}} {{on "change" this.setDuration}}>
              {{#each (array 1 2 3 4 5 6 7 8 9 10) as |val|}}
                <option value={{val}} selected={{eq val this.duration}}>{{val}}</option>
              {{/each}}
            </select>
          </EditableField>
        {{else}}
          {{this.duration}}
        {{/if}}
      </span>
    </div>
  </div>
</div>