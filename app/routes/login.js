import Ember from 'ember';
import EmberConfig from 'ilios/config/environment';
import UnauthenticatedRouteMixin from 'simple-auth/mixins/unauthenticated-route-mixin';
import ajax from 'ic-ajax';

export default Ember.Route.extend(UnauthenticatedRouteMixin, {
  currentUser: Ember.inject.service(),
  beforeModel(transition){
    this._super(transition);
    let deferred = Ember.RSVP.defer();
    var configUrl = '/auth/config';
    var tokenUrl = '/auth/token';
    ajax(configUrl).then(data => {
      let config = data.config;
      if(config.type === 'shibboleth'){
        ajax(tokenUrl).then(token => {
          if(!token.jwt){
            let shibbolethLoginUrl = config.loginUrl;
            if(EmberConfig.redirectAfterShibLogin){
              let basePath = window.location.href.replace(/(.+\w\/)(.+)/,"/$2");
              let attemptedRoute = encodeURIComponent(basePath + '/login');
               shibbolethLoginUrl += '?target=' + attemptedRoute;
            }
            window.location.replace(shibbolethLoginUrl);
          } else {
            let authenticator = 'simple-auth-authenticator:jwt-resolved';

            this.get('session').authenticate(authenticator, token.jwt).then(() => {
              let jwt = this.get('session').get('secure.jwt');
              let js = atob(jwt.split('.')[1]);
              let obj = $.parseJSON(js);
              this.get('currentUser').set('currentUserId', obj.user_id);
            });
          }
        });
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  }
});
