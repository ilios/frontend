import Ember from 'ember';
import jwtDecode from 'jwt-decode';

const { Route, inject } = Ember;
const { service } = inject;
import fetch from 'fetch';

export default Route.extend({
  serverVariables: service(),
  session: service(),
  async model({token}){
    const tokenData = jwtDecode(token);
    const audience = tokenData.aud;
    const apiHost = tokenData.apiHost;
    const apiNameSpace = tokenData.apiNameSpace;

    if (audience !== 'ilios-lti-app' || !apiHost || !apiNameSpace) {
      this.transitionTo('login-error');
      return;
    }
    const jwt = await this.getNewToken(token, apiHost);

    const session = this.get('session');
    let authenticator = 'authenticator:ilios-jwt';
    session.authenticate(authenticator, {jwt});
    session.set('data.apiHost', apiHost);
    session.set('data.apiNameSpace', apiNameSpace);

    this.transitionTo('index');
  },
  async getNewToken(ltiToken, apiHost){
    const url = `${apiHost}/auth/token`;
    const response = await fetch(url, {
      headers: {
        'X-JWT-Authorization': ltiToken
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
