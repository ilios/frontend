import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { Promise } from 'rsvp';
import EmberConfig from 'frontend/config/environment';

export default class LoginRoute extends Route {
  @service currentUser;
  @service fetch;
  @service iliosConfig;
  @service session;

  noAccountExistsAccount = null;
  noAccountExistsError = false;

  beforeModel() {
    this.session.prohibitAuthentication('index');
    return this.attemptSSOAuth();
  }

  setupController(controller) {
    controller.set('noAccountExistsError', this.noAccountExistsError);
    controller.set('noAccountExistsAccount', this.noAccountExistsAccount);
  }

  async attemptSSOAuth() {
    const type = await this.iliosConfig.getAuthenticationType();
    if (type === 'form' || type === 'ldap') {
      return;
    }
    if (type === 'shibboleth') {
      return await this.shibbolethAuth();
    }

    if (type === 'cas') {
      return await this.casLogin();
    }
  }

  async casLogin() {
    const currentUrl = [
      window.location.protocol,
      '//',
      window.location.host,
      window.location.pathname,
    ].join('');
    let loginUrl = `/auth/login?service=${currentUrl}`;

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

    if (isPresent(queryParams.ticket)) {
      loginUrl += `&ticket=${queryParams.ticket}`;
    }
    const response = await this.fetch.getJsonFromApiHost(loginUrl);
    if (response.status === 'redirect') {
      const casLoginUrl = await this.iliosConfig.itemFromConfig('casLoginUrl');
      await new Promise(() => {
        //this promise never resolves so we don't render anything before the redirect
        window.location.replace(`${casLoginUrl}?service=${currentUrl}`);
      });
    }
    if (response.status === 'noAccountExists') {
      this.noAccountExistsError = true;
      this.noAccountExistsAccount = response.userId;
      return;
    }
    if (response.status === 'success') {
      const authenticator = 'authenticator:ilios-jwt';
      this.session.authenticate(authenticator, { jwt: response.jwt });
    }
  }

  async shibbolethAuth() {
    const loginUrl = '/auth/login';
    const response = await this.fetch.getJsonFromApiHost(loginUrl);
    const status = response.status;
    if (status === 'redirect') {
      let shibbolethLoginUrl = await this.iliosConfig.itemFromConfig('loginUrl');
      if (EmberConfig.redirectAfterShibLogin) {
        const attemptedRoute = encodeURIComponent(window.location.href);
        shibbolethLoginUrl += '?target=' + attemptedRoute;
      }
      await new Promise(() => {
        //this promise never resolves so we don't render anything before the redirect
        window.location.replace(shibbolethLoginUrl);
      });
    }
    if (status === 'noAccountExists') {
      this.noAccountExistsError = true;
      this.noAccountExistsAccount = response.userId;
      return;
    }
    if (status === 'success') {
      const authenticator = 'authenticator:ilios-jwt';
      this.session.authenticate(authenticator, { jwt: response.jwt });
    }
  }
}
