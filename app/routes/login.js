import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { isPresent } from '@ember/utils';
import RSVP from 'rsvp';
import EmberConfig from 'ilios/config/environment';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

const { Promise } = RSVP;

export default Route.extend(UnauthenticatedRouteMixin, {
  currentUser: service(),
  session: service(),
  commonAjax: service(),
  iliosConfig: service(),
  titleToken: 'general.login',

  noAccountExistsError: false,
  noAccountExistsAccount: null,
  beforeModel(transition){
    this._super(transition);

    return this.attemptSSOAuth();
  },
  async attemptSSOAuth(){
    const iliosConfig = this.get('iliosConfig');
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
    const iliosConfig = this.get('iliosConfig');
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
      let authenticator = 'authenticator:ilios-jwt';
      this.get('session').authenticate(authenticator, {jwt: response.jwt});
    }
  },
  async shibbolethAuth(){
    const iliosConfig = this.get('iliosConfig');
    const commonAjax = this.get('commonAjax');
    const loginUrl = '/auth/login';
    const response = await commonAjax.request(loginUrl);
    const status = response.status;
    if(status === 'redirect'){
      let shibbolethLoginUrl = await iliosConfig.itemFromConfig('loginUrl');
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
