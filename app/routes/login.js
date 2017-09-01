import Ember from 'ember';
import EmberConfig from 'ilios/config/environment';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

const { Route, inject, isPresent, RSVP }  = Ember;
const { service } = inject;
const { Promise } = RSVP;

export default Route.extend(UnauthenticatedRouteMixin, {
  currentUser: service(),
  session: service(),
  commonAjax: service(),
  titleToken: 'general.login',

  noAccountExistsError: false,
  noAccountExistsAccount: null,
  beforeModel(transition){
    this._super(transition);

    return this.attemptSSOAuth();
  },
  async attemptSSOAuth(){
    const configUrl = '/application/config';
    const commonAjax = this.get('commonAjax');
    const data = await commonAjax.request(configUrl);
    const config = data.config;
    const type = config.type;
    if(type === 'form' || type === 'ldap'){
      return;
    }
    if(type === 'shibboleth'){
      return await this.shibbolethAuth(config);
    }

    if(config.type === 'cas'){
      return await this.casLogin(config);
    }
  },
  async casLogin(config){
    const commonAjax = this.get('commonAjax');

    let currentUrl = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
    let loginUrl = `/auth/login?service=${currentUrl}`;

    let queryParams = {};
    if (window.location.search.length > 1) {
      window.location.search.substr(1).split('&').forEach(str => {
        let arr = str.split('=');
        queryParams[arr[0]] = arr[1];
      });
    }

    if (isPresent(queryParams.ticket)) {
      loginUrl += `&ticket=${queryParams.ticket}`;
    }
    const response = await commonAjax.request(loginUrl);
    if(response.status === 'redirect'){
      let casLoginUrl = config.casLoginUrl + `?service=${currentUrl}`;
      await new Promise(() => {
        //this promise never resolves so we don't render anything before the redirect
        window.location.replace(casLoginUrl);
      });
    }
    if(response.status === 'noAccountExists'){
      this.set('noAccountExistsError', true);
      this.set('noAccountExistsAccount', response.userId);
      return;
    }
    if(response.status === 'success'){
      let authenticator = 'authenticator:ilios-jwt';
      this.get('session').authenticate(authenticator, {jwt: response.jwt});
    }
  },
  async shibbolethAuth(config){
    const commonAjax = this.get('commonAjax');
    const loginUrl = '/auth/login';
    const response = await commonAjax.request(loginUrl);
    const status = response.status;
    if(status === 'redirect'){
      let shibbolethLoginUrl = config.loginUrl;
      if(EmberConfig.redirectAfterShibLogin){
        let attemptedRoute = encodeURIComponent(window.location.href);
        shibbolethLoginUrl += '?target=' + attemptedRoute;
      }
      await new Promise(() => {
        //this promise never resolves so we don't render anything before the redirect
        window.location.replace(shibbolethLoginUrl);
      });
    }
    if(status === 'noAccountExists'){
      this.set('noAccountExistsError', true);
      this.set('noAccountExistsAccount', response.userId);
      return;
    }
    if(status === 'success'){
      let authenticator = 'authenticator:ilios-jwt';
      this.get('session').authenticate(authenticator, {jwt: response.jwt});
    }
  },
  setupController(controller) {
    controller.set('noAccountExistsError', this.get('noAccountExistsError'));
    controller.set('noAccountExistsAccount', this.get('noAccountExistsAccount'));
  },
});
