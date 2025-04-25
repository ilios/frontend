import Route from '@ember/routing/route';
import { service } from '@ember/service';
import jwtDecode from '../utils/jwt-decode';
import { set } from '@ember/object';

export default class ApplicationRoute extends Route {
  @service serverVariables;
  @service session;
  @service router;

  async model({ token }) {
    const tokenData = jwtDecode(token);
    const audience = tokenData.aud;
    const apiHost = tokenData.apiHost;
    const apiNameSpace = tokenData.apiNameSpace;

    const queryParams = {};
    if (window.location.search.length > 1) {
      window.location.search
        .substr(1)
        .split('&')
        .forEach((str) => {
          const arr = str.split('=');
          queryParams[arr[0]] = arr[1];
        });
    }

    if (audience !== 'ilios-lti-app' || !apiHost || !apiNameSpace) {
      console.error('Unable to authenticate user');
      console.error(tokenData);

      this.router.transitionTo('login-error');
      return;
    }
    const jwt = await this.getNewToken(token, apiHost);

    const authenticator = 'authenticator:ilios-jwt';
    this.session.authenticate(authenticator, { jwt });
    set(this.session, 'data.apiHost', apiHost);
    set(this.session, 'data.apiNameSpace', apiNameSpace);

    this.router.transitionTo(`/courses/${queryParams.course_id}`);
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
