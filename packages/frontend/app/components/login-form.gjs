import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class LoginFormComponent extends Component {
  @service session;
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
      const session = this.session;
      const authenticator = 'authenticator:ilios-jwt';
      await session.authenticate(authenticator, {
        username: this.username,
        password: this.password,
      });
    } catch (response) {
      const keys = response.json.errors.map((key) => {
        return 'general.' + key;
      });
      this.error = { keys };
    } finally {
      this.validations.clearErrorDisplay();
    }
  });

  @action
  async submitOnEnter(event) {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.authenticate.perform();
    }
  }
}

<div class="login-form" data-test-login-form ...attributes>
  {{#let (unique-id) as |templateId|}}
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
          {{! template-lint-disable no-autofocus-attribute }}
          <input
            autocapitalize="off"
            autocorrect="off"
            autofocus=""
            autocomplete="username"
            id="username-{{templateId}}"
            type="text"
            disabled={{if this.authenticate.isRunning "disabled"}}
            value={{this.username}}
            {{on "input" (pick "target.value" (set this "username"))}}
            {{on "keyup" this.submitOnEnter}}
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
            class="done {{if this.authenticate.isRunning 'active'}}"
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