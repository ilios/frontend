import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

const { inject } = Ember;
const { service } = inject;

export default Ember.Route.extend(ApplicationRouteMixin, {
  flashMessages: service(),

  actions: {
    sessionInvalidationSucceeded(){
      this.get('flashMessages').success('auth.confirmLogout');
      this.transitionTo('login');
    },

    error(error, transition) {
      transition.abort();

      this.get('flashMessages').alert('general.transitionErrorMessage');

      // Manage route-related errors
      // Ember.onerror(error);

      // Substate implementation when returning `true` (i.e. error.hbs)
      // return true;
    }
  }
});
