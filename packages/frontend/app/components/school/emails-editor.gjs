import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { validatable, Custom, IsEmail, Length, NotBlank } from 'ilios-common/decorators/validation';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isBlank, typeOf } from '@ember/utils';
import EmailValidator from 'validator/es/lib/isEmail';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import queue from 'ilios-common/helpers/queue';
import ValidationError from 'ilios-common/components/validation-error';

@validatable
export default class SchoolEmailsEditorComponent extends Component {
  @service intl;

  @tracked @Length(1, 100) @NotBlank() @IsEmail() administratorEmail =
    this.args.school.iliosAdministratorEmail || '';
  @tracked
  @Length(0, 300)
  @Custom('validateChangeAlertRecipientsCallBack', 'validateChangeAlertRecipientsMessageCallBack')
  changeAlertRecipients = this.args.school.changeAlertRecipients || '';

  get changeAlertRecipientsFormatted() {
    return this.changeAlertRecipients
      .trim()
      .split(',')
      .map((email) => email.trim())
      .filter((email) => !isBlank(email))
      .join(', ');
  }

  @action
  validateChangeAlertRecipientsCallBack() {
    if ('string' !== typeOf(this.changeAlertRecipients)) {
      return true;
    }
    const emails = this.changeAlertRecipients
      .trim()
      .split(',')
      .map((email) => email.trim())
      .filter((email) => !isBlank(email));
    return emails.reduce((valid, email) => EmailValidator(email) && valid, true);
  }

  @action
  validateChangeAlertRecipientsMessageCallBack() {
    return this.intl.t('errors.invalidChangeAlertRecipients');
  }

  save = dropTask(async () => {
    this.addErrorDisplaysFor(['administratorEmail', 'changeAlertRecipients']);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }

    await this.args.save(this.administratorEmail, this.changeAlertRecipientsFormatted);
    this.clearErrorDisplay();
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
            <button type="button" class="bigadd" {{on "click" (perform this.save)}} data-test-save>
              <FaIcon
                @icon={{if this.save.isRunning "spinner" "check"}}
                @spin={{this.save.isRunning}}
              />
            </button>
            <button type="button" class="bigcancel" {{on "click" @cancel}} data-test-cancel>
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
                {{on
                  "keyup"
                  (queue
                    (fn this.addErrorDisplayFor "administratorEmail") (perform this.saveOrCancel)
                  )
                }}
              />
              <ValidationError @validatable={{this}} @property="administratorEmail" />
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
                {{on
                  "keyup"
                  (queue
                    (fn this.addErrorDisplayFor "changeAlertRecipients") (perform this.saveOrCancel)
                  )
                }}
              />
              <ValidationError @validatable={{this}} @property="changeAlertRecipients" />
            </div>
          </div>
        </div>
      </section>
    {{/let}}
  </template>
}
