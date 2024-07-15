import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { validatable, Custom, IsEmail, Length, NotBlank } from 'ilios-common/decorators/validation';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isBlank, typeOf } from '@ember/utils';
import EmailValidator from 'validator/es/lib/isEmail';

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
}
