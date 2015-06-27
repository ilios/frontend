import Ember from 'ember';

export default Ember.Controller.extend({
  currentUser: Ember.inject.service(),
  actions: {
    authenticate: function() {
      let credentials = this.getProperties('identification', 'password');
      let authenticator = 'simple-auth-authenticator:jwt';

      this.get('session').authenticate(authenticator, credentials).then(() => {
        let jwt = this.get('session').get('secure.jwt');
        let js = atob(jwt.split('.')[1]);
        let obj = $.parseJSON(js);
        this.get('currentUser').set('currentUserId', obj.user_id);
      });
    }
  }
});
