import Ember from 'ember';
import EmberConfig from 'ilios/config/environment';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

const { Route, inject, isPresent }  = Ember;
const { service } = inject;

export default Route.extend(UnauthenticatedRouteMixin, {
  currentUser: service(),
  session: service(),
  ajax: service(),
  titleToken: 'general.login',

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
    this.get('ajax').request(configUrl).then(data => {
      let config = data.config;
      if(config.type === 'form' || config.type === 'ldap'){
        defer.resolve();
        return;
      }

      if(config.type === 'shibboleth'){
        this.get('ajax').request(loginUrl).then(response => {
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
            this.set('noAccountExistsAccount', response.userId);
            defer.resolve();
            return;
          }
          if(response.status === 'success'){
            let authenticator = 'authenticator:ilios-jwt';
            this.get('session').authenticate(authenticator, {jwt: response.jwt});
          }
        });
      }

      if(config.type === 'cas'){
        let location = window.location;
        let currentUrl = [location.protocol, '//', location.host, location.pathname].join('');
        let queryParams = {};
        if (location.search.length > 1) {
          location.search.substr(1).split('&').forEach(str => {
            let arr = str.split('=');
            queryParams[arr[0]] = arr[1];
          });
        }

        loginUrl += `?service=${currentUrl}`;
        if (isPresent(queryParams.ticket)) {
          loginUrl += `&ticket=${queryParams.ticket}`;
        }
        this.get('ajax').request(loginUrl).then(response => {
          if(response.status === 'redirect'){
            let casLoginUrl = config.casLoginUrl + `?service=${currentUrl}`;
            return window.location.replace(casLoginUrl);
          }
          if(response.status === 'noAccountExists'){
            this.set('noAccountExistsError', true);
            this.set('noAccountExistsAccount', response.userId);
            defer.resolve();
            return;
          }
          if(response.status === 'success'){
            let authenticator = 'authenticator:ilios-jwt';
            this.get('session').authenticate(authenticator, {jwt: response.jwt});
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
