import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import config from 'ilios/config/environment';

const { inject } = Ember;
const { service } = inject;

export default Ember.Route.extend(ApplicationRouteMixin, {
  flashMessages: service(),
  ajax: service(),

  //Override the default session invalidator so we can do auth stuff
  sessionInvalidated() {
    if (!Ember.testing) {
      let logoutUrl = '/auth/logout';
      return this.get('ajax').request(logoutUrl).then(response => {
        if(response.status === 'redirect'){
          window.location.replace(response.logoutUrl);
        } else {
          this.get('flashMessages').success('auth.confirmLogout');
          window.location.replace(config.rootURL);
        }
      });
    }
  },
  actions: {
    error(error, transition) {
      transition.abort();

      this.get('flashMessages').alert('general.transitionErrorMessage');

      // Future Reference:
      // Uncommented code below would render substate (error.hbs)
      // return true;
    }
  }
});
