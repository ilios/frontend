import ESASessionService from 'ember-simple-auth/services/session';
import config from 'ilios/config/environment';
import * as Sentry from '@sentry/ember';
import { inject as service } from '@ember/service';

export default class SessionService extends ESASessionService {
  @service fetch;
  @service currentUser;
  @service store;

  async handleAuthentication() {
    super.handleAuthentication(...arguments);
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage('skipWaiting');
      }
    }
    const user = await this.currentUser.getModel();
    //preload all the schools, we need these everywhere
    //this is also done for authenticated users in the Application Route
    await this.store.findAll('school');
    Sentry.setUser({ id: user.id });
  }

  async handleInvalidation() {
    Sentry.configureScope((scope) => scope.clear());
    if (config.environment !== 'test') {
      const logoutUrl = '/auth/logout';
      return this.fetch.getJsonFromApiHost(logoutUrl).then((response) => {
        if (response.status === 'redirect') {
          window.location.replace(response.logoutUrl);
        } else {
          window.location.replace(config.rootURL);
        }
      });
    }
  }
}
