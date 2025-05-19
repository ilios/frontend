import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { dropTask, timeout } from 'ember-concurrency';
import { uniqueId, concat } from '@ember/helper';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import gt from 'ember-truth-helpers/helpers/gt';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { string } from 'yup';

export default class PasswordValidatorComponent extends Component {
  @service intl;

  @tracked hasErrorForPassword = false;
  @tracked password = null;
  @tracked isSaving = false;
  @tracked passwordStrengthScore = 0;

  validations = new YupValidations(this, {
    password: string().ensure().trim().required(),
  });

  @action
  async keyboard(event) {
    const keyCode = event.keyCode;

    if (13 === keyCode) {
      await this.save.perform();
    }
  }

  @action
  async setPassword(password) {
    this.password = password;
    await this.calculatePasswordStrengthScore();
  }

  async calculatePasswordStrengthScore() {
    const { default: zxcvbn } = await import('zxcvbn');
    const password = isEmpty(this.password) ? '' : this.password;
    const obj = zxcvbn(password);
    this.passwordStrengthScore = obj.score;
  }

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      this.hasErrorForPassword = true;
      return false;
    }
    await timeout(250); // artificial "validation processing"
    this.validations.clearErrorDisplay();
    this.hasErrorForPassword = false;
  });
  <template>
    {{#if (has-block)}}
      {{#let (uniqueId) as |templateId|}}
        <div class="password-validator" data-test-password-validator>
          <label for="password-{{templateId}}">
            {{t "general.password"}}:
          </label>
          {{yield
            this.password
            this.setPassword
            this.keyboard
            this.hasErrorForPassword
            this.passwordStrengthScore
          }}
        </div>
      {{/let}}
    {{else}}
      {{#let (uniqueId) as |templateId|}}
        <div class="password-validator" data-test-password-validator>
          <label for="password-{{templateId}}">
            {{t "general.password"}}:
          </label>
          <input
            id="password-{{templateId}}"
            type="text"
            value={{this.password}}
            {{on "input" (pick "target.value" this.setPassword)}}
            {{on "keyup" this.keyboard}}
            {{this.validations.attach "password"}}
            data-test-password-input
          />
          {{#if this.hasErrorForPassword}}
            <YupValidationMessage
              @description={{t "general.password"}}
              @validationErrors={{this.validations.errors.password}}
              data-test-password-validation-error-message
            />
          {{else if (gt this.password.length 0)}}
            <span
              class="password-strength {{concat 'strength-' this.passwordStrengthScore}}"
              data-test-password-strength-text
            >
              {{#if (eq this.passwordStrengthScore 0)}}
                {{t "general.tryHarder"}}
              {{else if (eq this.passwordStrengthScore 1)}}
                {{t "general.bad"}}
              {{else if (eq this.passwordStrengthScore 2)}}
                {{t "general.weak"}}
              {{else if (eq this.passwordStrengthScore 3)}}
                {{t "general.good"}}
              {{else if (eq this.passwordStrengthScore 4)}}
                {{t "general.strong"}}
              {{/if}}
            </span>
            <meter
              max="4"
              value={{this.passwordStrengthScore}}
              data-test-password-strength-meter
            ></meter>
          {{/if}}
        </div>
      {{/let}}
    {{/if}}
  </template>
}
