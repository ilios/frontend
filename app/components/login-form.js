import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { validatable, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class LoginFormComponent extends Component {
  @service session;
  @tracked error;
  @tracked @NotBlank() username;
  @tracked @NotBlank() password;

  @task
  *authenticate() {
    this.addErrorDisplaysFor(['username', 'password']);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    try {
      this.error = null;
      const session = this.session;
      const authenticator = 'authenticator:ilios-jwt';
      yield session.authenticate(authenticator, {
        username: this.username,
        password: this.password,
      });
    } catch (response) {
      const keys = response.json.errors.map((key) => {
        return 'general.' + key;
      });
      this.error = { keys };
    } finally {
      this.clearErrorDisplay();
    }
  }

  @action
  async submitOnEnter(event) {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.authenticate.perform();
    }
  }
}
