import Ember from 'ember';

const { Controller, inject } = Ember;
const { service } = inject;

export default Controller.extend({
  currentUser: service(),
  session: service(),
  errors: [],
  noAccountExistsError: false,
  noAccountExistsAccount: null,
  actions: {
    authenticate: function() {
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
