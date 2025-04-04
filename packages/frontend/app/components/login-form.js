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
