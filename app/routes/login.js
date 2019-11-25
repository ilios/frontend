import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { Promise } from 'rsvp';
import EmberConfig from 'ilios/config/environment';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin, {
  currentUser: service(),
  fetch: service(),
  iliosConfig: service(),
  session: service(),

  noAccountExistsAccount: null,
  noAccountExistsError: false,

  beforeModel(transition){
    this._super(transition);
    return this.attemptSSOAuth();
  },

  setupController(controller) {
    controller.set('noAccountExistsError', this.noAccountExistsError);
    controller.set('noAccountExistsAccount', this.noAccountExistsAccount);
  },

  async attemptSSOAuth(){
    const iliosConfig = this.iliosConfig;
    const type = await iliosConfig.get('authenticationType');
    if(type === 'form' || type === 'ldap'){
      return;
    }
    if(type === 'shibboleth'){
      return await this.shibbolethAuth();
    }

    if(type === 'cas'){
      return await this.casLogin();
    }
  },

  async casLogin() {
    const iliosConfig = this.iliosConfig;

    const currentUrl = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');
    let loginUrl = `/auth/login?service=${currentUrl}`;

    const queryParams = {};
    if (window.location.search.length > 1) {
      window.location.search.substr(1).split('&').forEach(str => {
        const arr = str.split('=');
        queryParams[arr[0]] = arr[1];
      });
    }

    if (isPresent(queryParams.ticket)) {
      loginUrl += `&ticket=${queryParams.ticket}`;
    }
    const response = await this.fetch.getJsonFromApiHost(loginUrl);
    if (response.status === 'redirect') {
      const casLoginUrl = await iliosConfig.itemFromConfig('casLoginUrl');
      await new Promise(() => {
        //this promise never resolves so we don't render anything before the redirect
        window.location.replace(`${casLoginUrl}?service=${currentUrl}`);
      });
    }
    if(response.status === 'noAccountExists'){
      this.set('noAccountExistsError', true);
      this.set('noAccountExistsAccount', response.userId);
      return;
    }
    if(response.status === 'success'){
      const authenticator = 'authenticator:ilios-jwt';
      this.session.authenticate(authenticator, {jwt: response.jwt});
    }
  },

  async shibbolethAuth(){
    const iliosConfig = this.iliosConfig;
    const loginUrl = '/auth/login';
    const response = await this.fetch.getJsonFromApiHost(loginUrl);
    const status = response.status;
    if(status === 'redirect'){
      let shibbolethLoginUrl = await iliosConfig.itemFromConfig('loginUrl');
      if(EmberConfig.redirectAfterShibLogin){
        const attemptedRoute = encodeURIComponent(window.location.href);
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
      const authenticator = 'authenticator:ilios-jwt';
      this.session.authenticate(authenticator, {jwt: response.jwt});
    }
  }
});
