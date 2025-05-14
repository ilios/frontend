import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { dropTask, timeout } from 'ember-concurrency';
import { uniqueId, fn, concat } from '@ember/helper';
import { on } from '@ember/modifier';
import queue from 'ilios-common/helpers/queue';
import pick from 'ilios-common/helpers/pick';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import gt from 'ember-truth-helpers/helpers/gt';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';
import ValidationError from 'ilios-common/components/validation-error';

@validatable
export default class PasswordValidatorComponent extends Component {
  @service intl;

  @tracked @Length(5) @NotBlank() password = null;
  @tracked isSaving = false;
  @tracked passwordStrengthScore = 0;

  @cached
  get hasErrorForPasswordData() {
    return new TrackedAsyncData(this.hasErrorFor('password'));
  }

  get hasErrorForPassword() {
    return this.hasErrorForPasswordData.isResolved ? this.hasErrorForPasswordData.value : false;
  }

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
    this.addErrorDisplaysFor(['password']);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    await timeout(250); // artificial "validation processing"
    this.clearErrorDisplay();
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
            this.addErrorDisplayFor
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
            {{on "keyup" (queue (fn this.addErrorDisplayFor "password"))}}
            {{on "keyup" this.keyboard}}
            data-test-password-input
          />
          {{#if this.hasErrorForPassword}}
            <ValidationError @validatable={{this}} @property="password" />
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
