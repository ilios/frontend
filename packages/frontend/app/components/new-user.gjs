{{#let (unique-id) as |templateId|}}
  <div class="new-user" data-test-new-user ...attributes>
    <h4 class="title">
      {{t "general.newUser"}}
    </h4>
    <div class="new-user-form">
      <div class="choose-form-type" data-test-user-type>
        <label>
          {{t "general.createNew"}}:
        </label>
        <ClickChoiceButtons
          @buttonContent1={{t "general.nonStudent"}}
          @buttonContent2={{t "general.student"}}
          @firstChoicePicked={{this.nonStudentMode}}
          @toggle={{set this "nonStudentMode" (not this.nonStudentMode)}}
        />
      </div>
      <div class="item" data-test-first-name>
        <label for="first-{{templateId}}">
          {{t "general.firstName"}}:
        </label>
        <input
          id="first-{{templateId}}"
          type="text"
          value={{this.firstName}}
          {{on "input" (pick "target.value" (set this "firstName"))}}
          {{on
            "keyup"
            (queue (fn this.addErrorDisplayFor "firstName") (perform this.saveOrCancel))
          }}
        />
        <ValidationError @validatable={{this}} @property="firstName" />
      </div>
      <div class="item" data-test-middle-name>
        <label for="middle-{{templateId}}">
          {{t "general.middleName"}}:
        </label>
        <input
          id="middle-{{templateId}}"
          type="text"
          value={{this.middleName}}
          {{on "input" (pick "target.value" (set this "middleName"))}}
          {{on
            "keyup"
            (queue (fn this.addErrorDisplayFor "middleName") (perform this.saveOrCancel))
          }}
        />
        <ValidationError @validatable={{this}} @property="middleName" />
      </div>
      <div class="item" data-test-last-name>
        <label for="last-{{templateId}}">
          {{t "general.lastName"}}:
        </label>
        <input
          id="last-{{templateId}}"
          type="text"
          value={{this.lastName}}
          {{on "input" (pick "target.value" (set this "lastName"))}}
          {{on "keyup" (queue (fn this.addErrorDisplayFor "lastName") (perform this.saveOrCancel))}}
        />
        <ValidationError @validatable={{this}} @property="lastName" />
      </div>
      <div class="item" data-test-campus-id>
        <label for="campus-{{templateId}}">
          {{t "general.campusId"}}:
        </label>
        <input
          id="campus-{{templateId}}"
          type="text"
          value={{this.campusId}}
          {{on "input" (pick "target.value" (set this "campusId"))}}
          {{on "keyup" (queue (fn this.addErrorDisplayFor "campusId") (perform this.saveOrCancel))}}
        />
        <ValidationError @validatable={{this}} @property="campusId" />
      </div>
      <div class="item" data-test-other-id>
        <label for="other-{{templateId}}">
          {{t "general.otherId"}}:
        </label>
        <input
          id="other-{{templateId}}"
          type="text"
          value={{this.otherId}}
          {{on "input" (pick "target.value" (set this "otherId"))}}
          {{on "keyup" (queue (fn this.addErrorDisplayFor "otherId") (perform this.saveOrCancel))}}
        />
        <ValidationError @validatable={{this}} @property="otherId" />
      </div>
      <div class="item" data-test-email>
        <label for="email-{{templateId}}">
          {{t "general.email"}}:
        </label>
        <input
          id="email-{{templateId}}"
          type="text"
          value={{this.email}}
          {{on "input" (pick "target.value" (set this "email"))}}
          {{on "keyup" (queue (fn this.addErrorDisplayFor "email") (perform this.saveOrCancel))}}
        />
        <ValidationError @validatable={{this}} @property="email" />
      </div>
      <div class="item" data-test-phone>
        <label for="phone-{{templateId}}">
          {{t "general.phone"}}:
        </label>
        <input
          id="phone-{{templateId}}"
          type="text"
          value={{this.phone}}
          {{on "input" (pick "target.value" (set this "phone"))}}
          {{on "keyup" (queue (fn this.addErrorDisplayFor "phone") (perform this.saveOrCancel))}}
        />
        <ValidationError @validatable={{this}} @property="phone" />
      </div>
      <div class="item" data-test-username>
        <label for="username-{{templateId}}">
          {{t "general.username"}}:
        </label>
        <input
          id="username-{{templateId}}"
          type="text"
          value={{this.username}}
          {{on "input" (pick "target.value" (set this "username"))}}
          {{on "input" (set this "showUsernameTakenErrorMessage" false)}}
          {{on "keyup" (queue (fn this.addErrorDisplayFor "username") (perform this.saveOrCancel))}}
        />
        <ValidationError @validatable={{this}} @property="username" />
        {{#if this.showUsernameTakenErrorMessage}}
          <span class="validation-error-message" data-test-duplicate-username>
            {{t "errors.duplicateUsername"}}
          </span>
        {{/if}}
      </div>
      <div class="item" data-test-password>
        <label for="password-{{templateId}}">
          {{t "general.password"}}:
        </label>
        <input
          id="password-{{templateId}}"
          type="text"
          value={{this.password}}
          {{on "input" (pick "target.value" (set this "password"))}}
          {{on "keyup" (queue (fn this.addErrorDisplayFor "password") (perform this.saveOrCancel))}}
        />
        <ValidationError @validatable={{this}} @property="password" />
      </div>
      <div class="item" data-test-school>
        <label for="primary-school-{{templateId}}">
          {{t "general.primarySchool"}}:
        </label>
        {{#if this.userModel.isResolved}}
          <select
            id="primary-school-{{templateId}}"
            {{on "change" (pick "target.value" (set this "schoolId"))}}
          >
            {{#each (sort-by "title" this.schools) as |school|}}
              <option value={{school.id}} selected={{eq school this.bestSelectedSchool}}>
                {{school.title}}
              </option>
            {{/each}}
          </select>
        {{/if}}
      </div>
      {{#unless this.nonStudentMode}}
        <div class="item last" data-test-cohort>
          <label for="primary-cohort-{{templateId}}">
            {{t "general.primaryCohort"}}:
          </label>
          <select
            id="primary-cohort-{{templateId}}"
            {{on "change" (pick "target.value" (set this "primaryCohortId"))}}
          >
            {{#each (sort-by "title" this.cohorts) as |cohort|}}
              <option value={{cohort.id}} selected={{eq cohort.id this.bestSelectedCohort.id}}>
                {{cohort.title}}
              </option>
            {{/each}}
          </select>
        </div>
      {{/unless}}
      <div class="buttons">
        <button
          type="button"
          class="done text"
          disabled={{this.save.isRunning}}
          {{on "click" (perform this.save)}}
          data-test-submit
        >
          {{#if this.save.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{t "general.done"}}
          {{/if}}
        </button>
        <button type="button" class="cancel text" {{on "click" @close}} data-test-cancel>
          {{t "general.cancel"}}
        </button>
      </div>
    </div>
  </div>
{{/let}}