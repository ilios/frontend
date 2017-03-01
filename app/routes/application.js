import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import config from 'ilios/config/environment';

const { inject } = Ember;
const { service } = inject;

export default Ember.Route.extend(ApplicationRouteMixin, {
  flashMessages: service(),
  ajax: service(),
  i18n: service(),

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
      return this.get('ajax').request(logoutUrl).then(response => {
        if(response.status === 'redirect'){
          window.location.replace(response.logoutUrl);
        } else {
          this.get('flashMessages').success('general.confirmLogout');
          window.location.replace(config.rootURL);
        }
      });
    }
  },

  actions: {
    willTransition: function() {
      let controller = this.controllerFor('application');
      controller.set('errors', []);
      controller.set('showErrorDisplay', false);
    }
  }
});
