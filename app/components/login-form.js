import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  session: service(),
  classNames: ['login-form'],
  errors: null,
  noAccountExistsError: false,
  noAccountExistsAccount: null,
  username: null,
  password: null,
  authenticate: task(function* () {
    try {
      this.set('errors', []);
      const credentials = this.getProperties('username', 'password');
      const session = this.session;
      const authenticator = 'authenticator:ilios-jwt';
      yield session.authenticate(authenticator, credentials);
    } catch (error) {
      const keys = error.keys.map(key => {
        return ('general.' + key);
      });
      this.set('error', { 'message': error.message, 'keys': keys });
    }
  }),
});
