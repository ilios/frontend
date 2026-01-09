import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';
import { loadPolyfills } from 'ilios-common/utils/load-polyfills';
import { launchWorker } from '../utils/launch-worker';
import { formats } from 'ilios-common/app/ember-intl';
import ENV from 'frontend/config/environment';

export default class AuthenticatedRoute extends Route {
  @service currentUser;
  @service intl;
  @service store;
  @service router;
  @service session;
  @service('local-storage') ls;

  @tracked event;

  async beforeModel() {
    await launchWorker();
    await this.session.setup();
    await loadPolyfills();
    this.intl.setFormats(formats);
    // Set the default locale.
    this.intl.setLocale(this.initialLocale());
    const locale = this.intl.primaryLocale;
    window.document.querySelector('html').setAttribute('lang', locale);
  }

  async afterModel() {
    if (this.session.isAuthenticated) {
      //preload all the schools, we need these everywhere
      //this is also done when a user is first authetnicated in app/services/session.js
      await this.store.findAll('school');
    }
  }

  async activate() {
    //remove our loading animation once the application is loaded
    document.getElementById('ilios-loading-indicator')?.remove();
    if ('serviceWorker' in navigator) {
      const { controller: currentController } = navigator.serviceWorker;
      this.event = navigator.serviceWorker.addEventListener('controllerchange', async () => {
        // only reload the page if there was a previously active controller
        if (currentController) {
          window.location.reload();
        }
      });
    }
    if (this.currentUser.currentUserId) {
      Sentry.setUser({ id: this.currentUser.currentUserId });
    }
  }

  // check if we have a saved, valid locale
  initialLocale() {
    const itemVal = this.ls.get('locale');

    if (itemVal !== undefined) {
      if (ENV.APP.SUPPORTED_LOCALES.includes(itemVal)) {
        return itemVal;
      }
    }
    return ENV.APP.DEFAULTS.localStorage['locale'];
  }
}
