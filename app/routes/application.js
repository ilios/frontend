import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';
import config from 'ilios/config/environment';
import ajax from 'ic-ajax';

const { inject } = Ember;
const { service } = inject;

export default Ember.Route.extend(ApplicationRouteMixin, {
  flashMessages: service(),
  actions: {
    //Override the default session invalidator so we can do shibboleth stuff
    sessionInvalidationSucceeded() {
      if (!Ember.testing) {
        let logoutUrl = '/auth/logout';
        return ajax(logoutUrl).then(response => {
          if(response.status === 'redirect'){
            window.location.replace(response.logoutUrl);
          } else {
            this.get('flashMessages').success('auth.confirmLogout');
            window.location.replace(config.baseURL);
          }
        });
      }
    },
    error(error, transition) {
      transition.abort();

      this.get('flashMessages').alert('general.transitionErrorMessage');

      // Future Reference:
      // Uncommented code below would render substate (error.hbs)
      // return true;
    }
  }
});
