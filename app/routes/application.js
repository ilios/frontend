import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import config from 'ilios/config/environment';
import { all } from 'rsvp';
import * as Sentry from '@sentry/browser';

export default Route.extend(ApplicationRouteMixin, {
  currentUser: service(),
  fetch: service(),
  intl: service(),
  moment: service(),
  session: service(),
  store: service(),

  init() {
    this._super(...arguments);
    this.on('routeWillChange', () => {
      let controller = this.controllerFor('application');
      controller.set('errors', []);
      controller.set('showErrorDisplay', false);
    });
  },

  beforeModel() {
    const intl = this.intl;
    const moment = this.moment;
    const locale = intl.get('locale');
    moment.setLocale(locale);
    window.document.querySelector('html').setAttribute('lang', locale);
  },

  /**
   * Preload the user model and the users roles
   * This makes the initial page rendering (especially the navigation) much smoother
   */
  async afterModel() {
    const currentUser = this.currentUser;
    const user = await currentUser.get('model');
    if (user) {
      await all([
        user.get('roles'),
        this.store.findAll('school')
      ]);
    }
  },

  activate() {
    if ('serviceWorker' in navigator) {
      const { controller: currentController } = navigator.serviceWorker;
      const event = navigator.serviceWorker.addEventListener('controllerchange', async () => {
        // only reload the page if there was a previously active controller
        if (currentController) {
          window.location.reload();
        }
      });
      this.set('event', event);
    }

    const session = this.session;
    session.on('authenticationSucceeded', async () => {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.waiting) {
          reg.waiting.postMessage('skipWaiting');
        }
      }
    });
    const { currentUserId } = this.currentUser;
    if (currentUserId) {
      Sentry.setUser({id: currentUserId});
    }
  },

  deactivate() {
    const event = this.event;
    if (event && 'serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener(event);
    }
  },

  actions: {
    loading(transition) {
      let controller = this.controllerFor('application');
      controller.set('currentlyLoading', true);
      transition.promise.finally(() => {
        controller.set('currentlyLoading', false);
      });

      return true;
    }
  },

  //Override the default session invalidator so we can do auth stuff
  sessionInvalidated() {
    Sentry.configureScope(scope => scope.clear());
    if (config.environment !== 'test') {
      let logoutUrl = '/auth/logout';
      return this.fetch.getJsonFromApiHost(logoutUrl).then(response => {
        if(response.status === 'redirect'){
          window.location.replace(response.logoutUrl);
        } else {
          this.flashMessages.success('general.confirmLogout');
          window.location.replace(config.rootURL);
        }
      });
    }
  }
});
