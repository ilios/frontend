import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { DateTime } from 'luxon';
import { task, timeout } from 'ember-concurrency';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import UserProfileRoles from 'frontend/components/user-profile-roles';
import sortBy from 'ilios-common/helpers/sort-by';
import UserProfilePermissions from 'frontend/components/user-profile-permissions';
import LearnerGroups from 'frontend/components/user-profile/learner-groups';
import or from 'ember-truth-helpers/helpers/or';
import CopyButton from 'ilios-common/components/copy-button';
import FaIcon from 'ilios-common/components/fa-icon';
import { on } from '@ember/modifier';
import pipe from 'ilios-common/helpers/pipe';
import DatePicker from 'ilios-common/components/date-picker';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class MyProfileComponent extends Component {
  @service fetch;
  @service flashMessages;
  @service iliosConfig;
  @service session;

  @tracked expiresAt = null;
  @tracked generatedJwt = null;
  @tracked maxDate = null;
  @tracked minDate = null;

  get apiDocsLink() {
    const apiPath = '/' + this.iliosConfig.apiNameSpace;
    const host = this.iliosConfig.host
      ? this.iliosConfig.host
      : window.location.protocol + '//' + window.location.host;
    const docPath = host + apiPath.replace('v3', 'doc');
    return `<a href="${docPath}">${docPath}</a>`;
  }

  constructor() {
    super(...arguments);
    this.reset();
  }

  @action
  tokenCopied() {
    this.flashMessages.success('general.copiedSuccessfully');
  }

  @action
  selectExpiresAtDate(selectedDate) {
    this.expiresAt = selectedDate;
  }

  @action
  reset() {
    const midnightToday = DateTime.fromObject({
      hour: 23,
      minute: 59,
      second: 59,
    });
    const twoWeeksFromNow = midnightToday.plus({ weeks: 2 });
    const oneYearFromNow = midnightToday.plus({ years: 1 });
    this.minDate = midnightToday.toJSDate();
    this.maxDate = oneYearFromNow.toJSDate();
    this.expiresAt = twoWeeksFromNow.toJSDate();
    this.generatedJwt = null;
  }

  createNewToken = task(async () => {
    await timeout(1); //small delay to allow rendering the spinner

    //set the expiration time to the end of the day
    const expiresAt = DateTime.fromJSDate(this.expiresAt).set({ hour: 23, minute: 59, second: 59 });
    //calculate the difference between now and the expiration time, and round each unit down (so we don't get secionds like 31.123)
    const diff = expiresAt.diffNow(['days', 'hours', 'minutes', 'seconds']).mapUnits(Math.floor);
    //Use Luxon's ISO format to get a string like "P1DT2H3M4S" which is 1 day, 2 hours, 3 minutes, and 4 seconds
    const interval = diff.toISO();

    const url = '/auth/token?ttl=' + interval;
    const data = await this.fetch.getJsonFromApiHost(url);
    this.generatedJwt = data.jwt;
  });

  invalidateTokens = task(async () => {
    await timeout(10); //small delay to allow rendering the spinner
    const url = '/auth/invalidatetokens';
    const data = await this.fetch.getJsonFromApiHost(url);

    if (isPresent(data.jwt)) {
      const flashMessages = this.flashMessages;
      const session = this.session;
      const authenticator = 'authenticator:ilios-jwt';
      session.authenticate(authenticator, { jwt: data.jwt });
      flashMessages.success('general.successfullyInvalidatedTokens');
      this.args.toggleShowInvalidateTokens();
    }
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
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
                  {{#each (sortBy "title" @user.secondaryCohorts) as |cohort|}}
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
          <LearnerGroups @user={{@user}} />
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
                  <input id="new-token-{{templateId}}" readonly value={{this.generatedJwt}} />
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
  </template>
}
