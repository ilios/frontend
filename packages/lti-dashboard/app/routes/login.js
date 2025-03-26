import Route from '@ember/routing/route';
import { service } from '@ember/service';
import jwtDecode from '../utils/jwt-decode';

export default class LoginRoute extends Route {
  @service serverVariables;
  @service session;
  @service router;

  async model({ token }) {
    const tokenData = jwtDecode(token);
    const audience = tokenData.aud;
    const apiHost = tokenData.apiHost;
    const apiNameSpace = tokenData.apiNameSpace;

    if (audience !== 'ilios-lti-app' || !apiHost || !apiNameSpace) {
      /*eslint no-console: 0*/
      console.log('Unable to authenticate user');
      console.log(tokenData);

      this.router.transitionTo('login-error');
      return;
    }
    this.serverVariables.setApiVariables(apiHost, apiNameSpace);
    const jwt = await this.getNewToken(token, apiHost);
    await this.session.authenticate('authenticator:ilios-jwt', { jwt });
    this.router.transitionTo('index');
  }

  async getNewToken(ltiToken, apiHost) {
    const apiHostWithNoTrailingSlash = apiHost.replace(/\/+$/, '');
    const url = `${apiHostWithNoTrailingSlash}/auth/token`;
    const response = await fetch(url, {
      headers: {
        'X-JWT-Authorization': `Token ${ltiToken}`,
      },
    });
    if (response.ok) {
      const obj = await response.json();
      return obj.jwt;
    } else {
      throw new Error('Unable to extract token from refresh request');
    }
  }
}
