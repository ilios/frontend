import Ember from 'ember';

const { Controller} = Ember;

export default Controller.extend({
  currentUser: Ember.inject.service(),
  session: Ember.inject.service(),
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
