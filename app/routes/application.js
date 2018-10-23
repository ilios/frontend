/* eslint ember/order-in-routes: 0 */
import Ember from 'ember';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import config from 'ilios/config/environment';

export default Route.extend(ApplicationRouteMixin, {
  commonAjax: service(),
  intl: service(),
  moment: service(),
  currentUser: service(),
  session: service(),

  /**
  * Leave titles as an array
  * All of our routes send translations for the 'titleToken' key and we do the translating in head.hbs
  * and in the application controller.
  * @param Array tokens
  * @return Array
  */
  title(tokens){
    return tokens;
  },

  //Override the default session invalidator so we can do auth stuff
  sessionInvalidated() {
    if (!Ember.testing) {
      let logoutUrl = '/auth/logout';
      return this.get('commonAjax').request(logoutUrl).then(response => {
        if(response.status === 'redirect'){
          window.location.replace(response.logoutUrl);
        } else {
          this.get('flashMessages').success('general.confirmLogout');
          window.location.replace(config.rootURL);
        }
      });
    }
  },

  beforeModel() {
    const intl = this.get('intl');
    const moment = this.get('moment');
    const locale = intl.get('locale');
    moment.setLocale(locale);
    window.document.querySelector('html').setAttribute('lang', locale);
  },

  /**
   * Preload the user model and the users roles
   * This makes the initial page rendering (especially the navigation) much smoother
   */
  async afterModel() {
    const currentUser = this.get('currentUser');
    const user = await currentUser.get('model');
    if (user) {
      await user.get('roles');
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

    const session = this.get('session');
    session.on('authenticationSucceeded', async () => {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && reg.waiting) {
          reg.waiting.postMessage('skipWaiting');
        }
      }
    });
  },

  deactivate() {
    const event = this.get('event');
    if (event && 'serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener(event);
    }
  },

  actions: {
    willTransition() {
      let controller = this.controllerFor('application');
      controller.set('errors', []);
      controller.set('showErrorDisplay', false);
    },
    loading(transition) {
      let controller = this.controllerFor('application');
      controller.set('currentlyLoading', true);
      transition.promise.finally(() => {
        controller.set('currentlyLoading', false);
      });

      return true;
    }
  }
});
