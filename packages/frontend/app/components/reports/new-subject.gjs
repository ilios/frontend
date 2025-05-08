{{#let (unique-id) as |templateId|}}
  <div class="reports-new-subject" data-test-reports-new-subject ...attributes>
    <div class="title" data-test-component-title>
      {{t "general.newReport"}}
    </div>
    <div class="new-subject-content">
      <p data-test-title>
        <label for="title-{{templateId}}">
          {{t "general.reportTitle"}}:
        </label>
        <div>
          <input
            id="title-{{templateId}}"
            type="text"
            value={{this.title}}
            {{on "focusout" (fn this.addErrorDisplayFor "title")}}
            {{on "input" (pick "target.value" (set this "selectedTitle"))}}
            {{on "keyup" (fn this.addErrorDisplayFor "title")}}
          />
          <ValidationError @validatable={{this}} @property="title" />
        </div>
      </p>
      <p data-test-school>
        <label for="for-{{templateId}}">
          {{t "general.for"}}
        </label>
        <select id="for-{{templateId}}" {{on "change" (pick "target.value" this.changeSchool)}}>
          <option value="null" selected={{eq null this.currentSchool}}>
            {{t "general.allSchools"}}
          </option>
          {{#each (sort-by "title" this.allSchools) as |school|}}
            <option value={{school.id}} selected={{eq school.id this.currentSchool.id}}>
              {{school.title}}
            </option>
          {{/each}}
        </select>
      </p>
      <p data-test-subject>
        <label for="all-{{templateId}}">
          {{t "general.all"}}
        </label>
        <select id="all-{{templateId}}" {{on "change" (pick "target.value" this.changeSubject)}}>
          {{#each this.subjectList as |o|}}
            <option value={{o.value}} selected={{eq o.value this.subject}}>
              {{o.label}}
            </option>
          {{/each}}
        </select>
      </p>
      <p data-test-object>
        <label for="associated-{{templateId}}">
          {{t "general.associatedWith"}}
        </label>
        <div>
          <select
            id="associated-{{templateId}}"
            {{on "change" (pick "target.value" this.changePrepositionalObject)}}
          >
            {{#if this.includeAnythingObject}}
              <option value="" selected={{eq null this.prepositionalObject}}>
                {{t "general.anything"}}
              </option>
            {{/if}}
            {{#each (sort-by "label" this.prepositionalObjectList) as |o|}}
              <option value={{o.value}} selected={{eq o.value this.prepositionalObject}}>
                {{o.label}}
              </option>
            {{/each}}
          </select>
          <ValidationError @validatable={{this}} @property="prepositionalObject" />
        </div>
      </p>
      <this.newPrepositionalObjectComponent
        @school={{this.currentSchool}}
        @templateId={{templateId}}
        @currentId={{this.prepositionalObjectId}}
        @changeId={{@setSelectedPrepositionalObjectId}}
      />
      <div class="input-buttons">
        <ValidationError
          @validatable={{this}}
          @property="prepositionalObjectId"
          data-test-validation-error
        />
        <button
          type="button"
          class="done text{{if this.prepositionalObjectIdMissing ' disabled'}}"
          {{on "click" (perform this.run)}}
          disabled={{this.run.isRunning}}
          data-test-run
        >
          {{t "general.runReport"}}
        </button>
        <button
          type="button"
          class="done text"
          {{on "click" (perform this.save)}}
          disabled={{this.save.isRunning}}
          data-test-save
        >
          {{#if this.save.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{t "general.save"}}
          {{/if}}
        </button>
        <button type="button" class="cancel text" {{on "click" @close}} data-test-cancel>
          {{t "general.cancel"}}
        </button>
      </div>
    </div>
  </div>
{{/let}}