import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { dropTask, timeout } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';

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
    // console.log('hasErrorForPassword', this.hasErrorForPasswordData.value);
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
}
