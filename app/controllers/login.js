import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Controller.extend({
  currentUser: Ember.inject.service(),
  actions: {
    authenticate: function() {
      let credentials = this.getProperties('identification', 'password');
      let authenticator = 'simple-auth-authenticator:jwt';

      this.get('session').authenticate(authenticator, credentials).then(() => {
        //doing this as here until ember-simple-auth is an injectable service
        var url = '/auth/whoami';
        ajax(url).then(data => {
          if(data.userId){
            this.get('currentUser').set('currentUserId', data.userId);
          }
        });
      });
    }
  }
});
