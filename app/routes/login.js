import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import jwtDecode from '../utils/jwt-decode';

import fetch from 'fetch';

export default Route.extend({
  serverVariables: service(),
  session: service(),
  async model({ token }) {
    const tokenData = jwtDecode(token);
    const audience = tokenData.aud;
    const apiHost = tokenData.apiHost;
    const apiNameSpace = tokenData.apiNameSpace;

    if (audience !== 'ilios-lti-app' || !apiHost || !apiNameSpace) {
      /*eslint no-console: 0*/
      console.log('Unable to authenticate user');
      console.log(tokenData);

      this.transitionTo('login-error');
      return;
    }
    const jwt = await this.getNewToken(token, apiHost);

    const authenticator = 'authenticator:ilios-jwt';
    this.session.authenticate(authenticator, { jwt });
    // eslint-disable-next-line ember/use-ember-get-and-set
    this.session.set('data.apiHost', apiHost);
    // eslint-disable-next-line ember/use-ember-get-and-set
    this.session.set('data.apiNameSpace', apiNameSpace);
  },
  async getNewToken(ltiToken, apiHost) {
    const apiHostWithNoTrailingSlash = apiHost.replace(/\/+$/, "");
    const url = `${apiHostWithNoTrailingSlash}/auth/token`;
    const response = await fetch(url, {
      headers: {
        'X-JWT-Authorization': `Token ${ltiToken}`
      }
    });
    if (response.ok) {
      const obj = await response.json();
      return obj.jwt;
    } else {
      throw new Error("Unable to extract token from refresh request");
    }
  }
});
