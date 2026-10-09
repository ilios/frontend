import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';
import { launchWorker } from '../utils/launch-worker';
import translationsForEnUs from 'virtual:ember-intl/translations/en-us';
import translationsForEs from 'virtual:ember-intl/translations/es';
import translationsForFr from 'virtual:ember-intl/translations/fr';

export default class AuthenticatedRoute extends Route {
  @service currentUser;
  @service intl;
  @service store;
  @service router;
  @service session;
  @service preferences;
  @service schoolConfig;

  @tracked event;

  async beforeModel(transition) {
    await launchWorker();
    this.#loadTranslations();
    await this.session.setup(transition.targetName === 'lti-login');
    // We need a default locale, preferences will always return something
    this.intl.setLocale(this.preferences.locale);
    if (this.currentUser.currentUserId) {
      await this.preferences.setup();
      //reset the locale, in case we had saved data that differed from local cache of defaults
      this.intl.setLocale(this.preferences.locale);
      window.document.documentElement.dataset.theme = this.preferences.theme;
    }

    window.document.querySelector('html').setAttribute('lang', this.intl.primaryLocale);
  }

  async afterModel() {
    if (this.session.isAuthenticated) {
      //preload all the schools and configs
      //this is also done when a user is first authetnicated in app/services/session.js
      await this.schoolConfig.load();
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

  #loadTranslations() {
    this.intl.addTranslations('en-us', translationsForEnUs);
    this.intl.addTranslations('es', translationsForEs);
    this.intl.addTranslations('fr', translationsForFr);
  }
}
