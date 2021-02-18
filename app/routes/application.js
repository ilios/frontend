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

  @tracked event;

  constructor() {
    super(...arguments);
    this.router.on('routeWillChange', () => {
      const controller = this.controllerFor('application');
      controller.set('errors', []);
      controller.set('showErrorDisplay', false);
    });
  }

  async beforeModel() {
    await loadPolyfills();
    const locale = this.intl.get('locale');
    this.moment.setLocale(locale);
    window.document.querySelector('html').setAttribute('lang', locale);
  }

  activate() {
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
      Sentry.setUser({id: this.currentUser.currentUserId});
    }
  }

  @action
  loading(transition) {
    const controller = this.controllerFor('application');
    controller.set('currentlyLoading', true);
    transition.promise.finally(() => {
      controller.set('currentlyLoading', false);
    });

    return true;
  }
}
