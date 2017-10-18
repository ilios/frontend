import Ember from 'ember';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import config from 'ilios/config/environment';


export default Route.extend(ApplicationRouteMixin, {
  flashMessages: service(),
  commonAjax: service(),
  i18n: service(),
  moment: service(),

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
    const i18n = this.get('i18n');
    const moment = this.get('moment');
    moment.setLocale(i18n.get('locale'));
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
    }
  }
});
