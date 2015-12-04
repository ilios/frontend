import Ember from 'ember';
import EmberConfig from 'ilios/config/environment';
import UnauthenticatedRouteMixin from 'simple-auth/mixins/unauthenticated-route-mixin';
import ajax from 'ic-ajax';

export default Ember.Route.extend(UnauthenticatedRouteMixin, {
  currentUser: Ember.inject.service(),
  noAccountExistsError: false,
  noAccountExistsAccount: null,
  beforeModel(transition){
    this._super(transition);

    return this.attemptSSOAuth();
  },
  attemptSSOAuth(){
    let defer = Ember.RSVP.defer();
    var configUrl = '/application/config';
    var loginUrl = '/auth/login';
    ajax(configUrl).then(data => {
      let config = data.config;
      if(config.type === 'form' || config.type === 'ldap'){
        defer.resolve();
        return;
      }
      
      if(config.type === 'shibboleth'){
        ajax(loginUrl).then(response => {
          if(response.status === 'redirect'){
            let shibbolethLoginUrl = config.loginUrl;
            if(EmberConfig.redirectAfterShibLogin){
              let attemptedRoute = encodeURIComponent(window.location.href);
               shibbolethLoginUrl += '?target=' + attemptedRoute;
            }
            window.location.replace(shibbolethLoginUrl);
          }
          if(response.status === 'noAccountExists'){
            this.set('noAccountExistsError', true);
            this.set('noAccountExistsAccount', response.eppn);
            defer.resolve();
            return;
          }
          if(response.status === 'success'){
            let authenticator = 'authenticator:ilios-jwt';
          
            this.get('session').authenticate(authenticator, {jwt: response.jwt}).then(() => {
              let jwt = this.get('session').get('secure.jwt');
              let js = atob(jwt.split('.')[1]);
              let obj = Ember.$.parseJSON(js);
              this.get('currentUser').set('currentUserId', obj.user_id);
            });
          }
        });
      }
    });

    return defer.promise;
  },
  setupController: function(controller){
    controller.set('noAccountExistsError', this.get('noAccountExistsError'));
    controller.set('noAccountExistsAccount', this.get('noAccountExistsAccount'));
  },
});
