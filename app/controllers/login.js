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

      }, response => {
        let mappedErrors = response.errors.map(str => {
          return 'auth.' + str;
        });
        this.set('errors', mappedErrors);
      });
    }
  }
});
