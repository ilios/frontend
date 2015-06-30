import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  flashMessages: Ember.inject.service(),
  actions: {
    sessionInvalidationSucceeded(){
      this.get('flashMessages').success('auth.confirmLogout');
      this.transitionTo('login');
    }
  }
});
