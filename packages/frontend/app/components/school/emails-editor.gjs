import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import isEmail from 'validator/lib/isEmail';

export default class SchoolEmailsEditorComponent extends Component {
  @service intl;

  @tracked administratorEmail = this.args.school.iliosAdministratorEmail || '';
  @tracked changeAlertRecipients = this.args.school.changeAlertRecipients || '';

  validations = new YupValidations(this, {
    administratorEmail: string()
      .ensure()
      .trim()
      .required()
      .max(100)
      .test(
        'email',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.email',
          };
        },
        (value) => {
          // short-circuit on empty input - this is being caught by `required()` already.
          // that way, we don't end up with two separate validation errors on empty input.
          if ('' === value) {
            return true;
          }
          // Yup's email validation is misaligned with our backend counterpart.
          // See https://github.com/jquense/yup?tab=readme-ov-file#stringemailmessage-string--function-schema
          // So we'll continue using the email validation provided by validator.js.
          return isEmail(value);
        },
      ),
    changeAlertRecipients: string()
      .ensure()
      .trim()
      .max(300)
      .test(
        'list-of-valid-emails',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.invalidChangeAlertRecipients',
          };
        },
        (value) => {
          const emails = value
            .split(',')
            .map((email) => email.trim())
            .filter((email) => !isBlank(email));
          return emails.reduce((valid, email) => isEmail(email) && valid, true);
        },
      ),
  });

  get changeAlertRecipientsFormatted() {
    return this.changeAlertRecipients
      .trim()
      .split(',')
      .map((email) => email.trim())
      .filter((email) => !isBlank(email))
      .join(', ');
  }

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    await this.args.save(this.administratorEmail, this.changeAlertRecipientsFormatted);

    this.args.cancel();
  });

  saveOrCancel = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.save.perform();
    } else if (27 === keyCode) {
      this.args.cancel();
    }
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
      <section class="school-emails-editor" data-test-school-emails-editor ...attributes>
        <div class="header">
          <div class="title">{{t "general.emails"}}</div>
          <div class="actions">
            <button
              type="button"
              class="bigadd"
              aria-label={{t "general.save"}}
              {{on "click" (perform this.save)}}
              data-test-save
            >
              <FaIcon
                @icon={{if this.save.isRunning "spinner" "check"}}
                @spin={{this.save.isRunning}}
              />
            </button>
            <button
              type="button"
              class="bigcancel"
              aria-label={{t "general.cancel"}}
              {{on "click" @cancel}}
              data-test-cancel
            >
              <FaIcon @icon="arrow-rotate-left" />
            </button>
          </div>
        </div>
        <div class="content">
          <div class="form">
            <div class="item" data-test-administrator-email>
              <label for="administrator-email-{{templateId}}">
                {{t "general.administratorEmail"}}
              </label>
              <input
                id="administrator-email-{{templateId}}"
                type="text"
                value={{this.administratorEmail}}
                placeholder={{this.administratorEmailPlaceholder}}
                {{on "input" (pick "target.value" (set this "administratorEmail"))}}
                {{on "keyup" (perform this.saveOrCancel)}}
                {{this.validations.attach "administratorEmail"}}
              />
              <YupValidationMessage
                @description={{t "general.administratorEmail"}}
                @validationErrors={{this.validations.errors.administratorEmail}}
                data-test-administrator-email-validation-error-message
              />
            </div>
            <div class="item" data-test-change-alert-recipients>
              <label for="change-alert-recipients-{{templateId}}">
                {{t "general.changeAlertRecipients"}}
              </label>
              <input
                id="change-alert-recipients-{{templateId}}"
                type="text"
                value={{this.changeAlertRecipients}}
                placeholder={{this.changeAlertRecipientsPlaceholder}}
                {{on "input" (pick "target.value" (set this "changeAlertRecipients"))}}
                {{on "keyup" (perform this.saveOrCancel)}}
              />
              <YupValidationMessage
                @description={{t "general.changeAlertRecipients"}}
                @validationErrors={{this.validations.errors.changeAlertRecipients}}
                data-test-change-alert-recipients-validation-error-message
              />
            </div>
          </div>
        </div>
      </section>
    {{/let}}
  </template>
}
