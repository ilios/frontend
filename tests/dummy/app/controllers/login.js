import Ember from 'ember';

const { Controller, inject } = Ember;
const { service } = inject;
export default Controller.extend({
  iliosConfig: service(),
  session: service(),
  jwt: null,
  error: null,
  actions: {
    async login(){
      this.set('error', null);
      const jwt = this.get('jwt');
      const iliosConfig = this.get('iliosConfig');

      if (jwt) {
        const apiHost = iliosConfig.get('apiHost');
        const url = `${apiHost}/auth/token`;
        const response = await fetch(url, {
          headers: {
            'X-JWT-Authorization': `Token ${jwt}`
          }
        });
        if (response.ok) {
          const obj = await response.json();
          const authenticator = 'authenticator:ilios-jwt';
          this.get('session').authenticate(authenticator, {jwt: obj.jwt});
        }
      }
    }
  }
});
