import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class LoginFormComponent extends Component {
  @service session;
  @tracked error;
  @tracked username;
  @tracked password;

  @task
  *authenticate() {
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
