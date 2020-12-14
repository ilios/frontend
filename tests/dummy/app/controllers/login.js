import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from "ember-concurrency-decorators";


export default class LoginController extends Controller {
  @service iliosConfig;
  @service session;
  @tracked jwt =  null;
  @tracked error = null;

  @dropTask
  *login(){
    this.error = null;

    if (this.jwt) {
      const apiHost = this.iliosConfig.get('apiHost');
      const url = `${apiHost}/auth/token`;
      const response = yield fetch(url, {
        headers: {
          'X-JWT-Authorization': `Token ${this.jwt}`
        }
      });
      if (response.ok) {
        const obj = yield response.json();
        const authenticator = 'authenticator:ilios-jwt';
        this.session.authenticate(authenticator, {jwt: obj.jwt});
      }
    }
  }

  @dropTask
  *loginOnEnter(event) {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      yield this.login.perform();
    }
  }
}
