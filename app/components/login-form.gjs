import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import focus from 'ilios-common/modifiers/focus';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import { waitForFetch } from '@ember/test-waiters';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class LoginFormComponent extends Component {
  @service session;
  @service iliosConfig;
  @tracked error;
  @tracked username;
  @tracked password;

  validations = new YupValidations(this, {
    username: string().required(),
    password: string().required(),
  });

  authenticate = task(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();

    if (!isValid) {
      return false;
    }

    try {
      this.error = null;
      const jwt = await this.loginWithCredentials({
        username: this.username,
        password: this.password,
      });
      this.session.authenticate('authenticator:ilios-jwt', { jwt });
    } catch (response) {
      const keys = response.json.errors.map((key) => {
        return 'general.' + key;
      });
      this.error = { keys };
    } finally {
      this.validations.clearErrorDisplay();
    }
  });

  get host() {
    return this.iliosConfig.apiHost
      ? this.iliosConfig.apiHost
      : window.location.protocol + '//' + window.location.host;
  }

  @action
  async submitOnEnter(event) {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.authenticate.perform();
    }
  }

  async loginWithCredentials(data) {
    const path = `${this.host}/auth/login`;
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    const response = await waitForFetch(fetch(path, options));

    const { statusText, status, headers } = response;

    if (status == 401) {
      this.session.invalidate();
    }

    const text = await response.text();
    const json = JSON.parse(text);
    if (!response.ok) {
      throw {
        statusText,
        status,
        headers,
        text,
        json,
      };
    }

    return json.jwt;
  }

  <template>
    <div class="login-form" data-test-login-form ...attributes>
      {{#let (uniqueId) as |templateId|}}
        {{#if @noAccountExistsError}}
          <div class="error" data-test-error>
            {{t "general.noAccountExists" accountName=@noAccountExistsAccount}}
          </div>
        {{else}}
          <h2 data-test-title>
            {{t "general.login"}}
          </h2>
          {{#each this.error.keys as |key|}}
            <div class="error" data-test-error>
              {{t key}}
            </div>
          {{/each}}
          <form data-test-form>
            <div class="item" data-test-username>
              <label for="username-{{templateId}}">
                {{t "general.username"}}:
              </label>
              <input
                autocapitalize="off"
                autocorrect="off"
                autocomplete="username"
                id="username-{{templateId}}"
                type="text"
                disabled={{if this.authenticate.isRunning "disabled"}}
                value={{this.username}}
                {{on "input" (pick "target.value" (set this "username"))}}
                {{on "keyup" this.submitOnEnter}}
                {{focus}}
                {{this.validations.attach "username"}}
              />
              <YupValidationMessage
                @description={{t "general.username"}}
                @validationErrors={{this.validations.errors.username}}
              />
            </div>
            <div class="item" data-test-password>
              <label for="password-{{templateId}}">
                {{t "general.password"}}:
              </label>
              <input
                id="password-{{templateId}}"
                type="password"
                autocomplete="current-password"
                disabled={{if this.authenticate.isRunning "disabled"}}
                value={{this.password}}
                {{on "input" (pick "target.value" (set this "password"))}}
                {{on "keyup" this.submitOnEnter}}
                {{this.validations.attach "username"}}
              />
              <YupValidationMessage
                @description={{t "general.password"}}
                @validationErrors={{this.validations.errors.password}}
              />
            </div>
            <div class="buttons">
              <button
                type="button"
                class="done{{if this.authenticate.isRunning ' active'}}"
                disabled={{if this.authenticate.isRunning "disabled"}}
                {{on "click" (perform this.authenticate)}}
                data-test-login
              >
                {{#if this.authenticate.isRunning}}
                  <LoadingSpinner />
                {{else}}
                  {{t "general.login"}}
                {{/if}}
              </button>
            </div>
          </form>
        {{/if}}
      {{/let}}
    </div>
  </template>
}
