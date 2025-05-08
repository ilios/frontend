{{#let (unique-id) as |templateId|}}
  <div class="my-profile" ...attributes data-test-my-profile>
    <h1 class="name" data-test-name>
      {{@user.fullName}}
    </h1>
    {{#if @user.isStudent}}
      <span class="is-student" data-test-is-student>
        <h2>
          {{t "general.student"}}
        </h2>
      </span>
    {{/if}}
    <div class="blocks">
      <UserProfileRoles @user={{@user}} @isManageable={{false}} />
      <div class="small-component my-profile-schools" data-test-info>
        <div>
          <label>
            {{t "general.primarySchool"}}:
          </label>
          <span data-test-primary-school>
            {{@user.school.title}}
          </span>
        </div>
        <div>
          <label>
            {{t "general.primaryCohort"}}:
          </label>
          <span data-test-primary-cohort>
            {{#if @user.primaryCohort}}
              {{@user.primaryCohort.title}}
            {{else}}
              {{t "general.unassigned"}}
            {{/if}}
          </span>
        </div>
        <div>
          <label>
            {{t "general.secondaryCohorts"}}:
          </label>
          {{#if @user.secondaryCohorts.length}}
            <ul class="secondary-cohorts details-list">
              {{#each (sort-by "title" @user.secondaryCohorts) as |cohort|}}
                <li data-test-secondary-cohort>
                  <span class="title">
                    {{cohort.title}}
                  </span>
                  <span class="content">
                    {{cohort.programYear.program.title}}
                  </span>
                </li>
              {{/each}}
            </ul>
          {{else}}
            <span data-test-secondary-cohort>{{t "general.unassigned"}}</span>
          {{/if}}
        </div>
      </div>
      <UserProfilePermissions
        @user={{@user}}
        @selectedSchoolId={{@permissionsSchool}}
        @selectedYearId={{@permissionsYear}}
        @setSchool={{@setPermissionsSchool}}
        @setYear={{@setPermissionsYear}}
      />
      <UserProfile::LearnerGroups @user={{@user}} />
    </div>
    <section class="token-maintenance" data-test-token-maintenance>
      <h3>
        {{t "general.manageAPITokens"}}
      </h3>
      <p data-test-token-info-link>
        {{! template-lint-disable no-triple-curlies }}
        {{{t "general.tokenInfo" apiDocsLink=this.apiDocsLink}}}
      </p>
      {{#if (or @showInvalidateTokens @showCreateNewToken)}}
        {{#if @showCreateNewToken}}
          {{#if this.generatedJwt}}
            <div class="new-token-result" data-test-new-token-result>
              <label for="new-token-{{templateId}}">
                {{t "general.newToken"}}:
              </label>
              <input id="new-token-{{templateId}}" readonly="" value={{this.generatedJwt}} />
              <CopyButton @success={{this.tokenCopied}} @clipboardText={{this.generatedJwt}}>
                <FaIcon @icon="copy" @title={{t "general.copyNewToken"}} />
              </CopyButton>
              <button
                type="button"
                class="bigcancel"
                data-test-result-reset
                {{on "click" (pipe @toggleShowCreateNewToken this.reset)}}
              >
                <FaIcon @icon="xmark" />
              </button>
            </div>
          {{else}}
            <div class="new-token-form" data-test-new-token-form>
              <label>
                {{t "general.validUntil"}}
              </label>
              <DatePicker
                @value={{this.expiresAt}}
                @maxDate={{this.maxDate}}
                @minDate={{this.minDate}}
                @onChange={{this.selectExpiresAtDate}}
              />
              <button
                type="button"
                class="bigadd"
                data-test-new-token-create
                {{on "click" (perform this.createNewToken)}}
              >
                {{#if this.createNewToken.isRunning}}
                  <LoadingSpinner />
                {{else}}
                  <FaIcon @icon="check" />
                {{/if}}
              </button>
              <button
                type="button"
                class="bigcancel"
                data-test-new-token-cancel
                {{on "click" (pipe @toggleShowCreateNewToken this.reset)}}
              >
                <FaIcon @icon="xmark" />
              </button>
            </div>
          {{/if}}
        {{/if}}
        {{#if @showInvalidateTokens}}
          <div class="invalidate-tokens-form" data-test-invalidate-tokens-form>
            <h3>
              {{t "general.invalidateTokens"}}
            </h3>
            <p>
              {{t "general.invalidateTokensConfirmation"}}
            </p>
            <button
              type="button"
              class="done text"
              data-test-invalidate-tokens-submit
              {{on "click" (perform this.invalidateTokens)}}
            >
              {{#if this.invalidateTokens.isRunning}}
                <LoadingSpinner />
              {{else}}
                {{t "general.yes"}}
              {{/if}}
            </button>
            <button
              type="button"
              class="cancel text"
              data-test-invalidate-tokens-cancel
              {{on "click" @toggleShowInvalidateTokens}}
            >
              {{t "general.cancel"}}
            </button>
          </div>
        {{/if}}
      {{else}}
        <button
          type="button"
          class="new-token done text"
          data-test-show-create-new-token
          {{on "click" @toggleShowCreateNewToken}}
        >
          {{t "general.createNew"}}
        </button>
        <button
          type="button"
          class="invalidate-tokens cancel text"
          data-test-show-invalidate-tokens
          {{on "click" @toggleShowInvalidateTokens}}
        >
          {{t "general.invalidateTokens"}}
        </button>
      {{/if}}
    </section>
  </div>
{{/let}}