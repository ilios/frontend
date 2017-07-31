import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  currentUser: service(),
  session: service(),
  errors: [],
  noAccountExistsError: false,
  noAccountExistsAccount: null,
  actions: {
    authenticate() {
      let credentials = this.getProperties('identification', 'password');
      let authenticator = 'authenticator:ilios-jwt';
      this.set('errors', []);
      this.get('session').authenticate(authenticator, credentials).then(() => {
      }, error => {
        let keys = error.keys.map(key => {
          return ('general.' + key);
        });
        this.set('error', { 'message': error.message, 'keys': keys });
      });
    }
  }
});
