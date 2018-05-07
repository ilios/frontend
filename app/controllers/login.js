import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  session: service(),
  errors: null,
  noAccountExistsError: false,
  noAccountExistsAccount: null,
  actions: {
    async authenticate() {
      try {
        let credentials = this.getProperties('identification', 'password');
        let authenticator = 'authenticator:ilios-jwt';
        this.set('errors', []);
        const session = this.get('session');
        await session.authenticate(authenticator, credentials);
      } catch (error) {
        let keys = error.keys.map(key => {
          return ('general.' + key);
        });
        this.set('error', { 'message': error.message, 'keys': keys });
      }
    }
  }
});
