import Ember from 'ember';

export default Ember.Controller.extend({
  currentUser: Ember.inject.service(),
  errors: [],
  noAccountExistsError: false,
  noAccountExistsAccount: null,
  actions: {
    authenticate: function() {
      let credentials = this.getProperties('identification', 'password');
      let authenticator = 'authenticator:ilios-jwt';
      this.set('errors', []);
      this.get('session').authenticate(authenticator, credentials).then(() => {
        let jwt = this.get('session').get('secure.jwt');
        let js = atob(jwt.split('.')[1]);
        let obj = $.parseJSON(js);
        this.get('currentUser').set('currentUserId', obj.user_id);
      }, response => {
        let mappedErrors = response.errors.map(str => {
          return 'auth.' + str;
        });
        this.set('errors', mappedErrors);
      });
    }
  }
});
