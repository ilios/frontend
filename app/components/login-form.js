import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  session: service(),
  tagName: "",
  noAccountExistsError: false,
  noAccountExistsAccount: null,
  username: null,
  password: null,
  authenticate: task(function* () {
    try {
      this.set('error', null);
      const credentials = this.getProperties('username', 'password');
      const session = this.session;
      const authenticator = 'authenticator:ilios-jwt';
      yield session.authenticate(authenticator, credentials);
    } catch (response) {
      const keys = response.json.errors.map(key => {
        return ('general.' + key);
      });
      this.set('error', { keys });
    }
  }),
});
