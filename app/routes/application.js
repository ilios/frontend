import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/browser';
import { loadPolyfills } from 'ilios-common/utils/load-polyfills';

export default class AuthenticatedRoute extends Route {
  @service currentUser;
  @service intl;
  @service moment;
  @service store;
  @service router;
  @service session;

  @tracked event;

  async beforeModel() {
    await this.session.setup();
    await loadPolyfills();
    const locale = this.intl.get('locale');
    this.moment.setLocale(locale);
    window.document.querySelector('html').setAttribute('lang', locale);
  }

  async afterModel() {
    if (this.session.isAuthenticated) {
      //preload all the schools, we need these everywhere
      //this is also done when a user is first authetnicated in app/services/session.js
      await this.store.findAll('school');
    }
  }

  activate() {
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

  @action
  loading(transition) {
    //@todo investigate if this is still a good pattern [JJ 3/21]
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor('application');
    controller.set('currentlyLoading', true);
    transition.promise.finally(() => {
      controller.set('currentlyLoading', false);
    });

    return true;
  }
}
