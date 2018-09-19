/* eslint ember/order-in-routes: 0 */
import Ember from 'ember';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import config from 'ilios/config/environment';

export default Route.extend(ApplicationRouteMixin, {
  commonAjax: service(),
  i18n: service(),
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
      return this.commonAjax.request(logoutUrl).then(response => {
        if(response.status === 'redirect'){
          window.location.replace(response.logoutUrl);
        } else {
          this.flashMessages.success('general.confirmLogout');
          window.location.replace(config.rootURL);
        }
      });
    }
  },
  beforeModel() {
    const i18n = this.i18n;
    const moment = this.moment;
    const locale = i18n.get('locale');
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
      await user.get('roles');
    }
  },

  activate() {
    if ('serviceWorker' in navigator) {
      const event = navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
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
  },
  deactivate() {
    const event = this.event;
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
