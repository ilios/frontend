import Ember from 'ember';

export default Ember.Route.extend({
  session: Ember.inject.service(),
  titleToken: 'general.logout',
  beforeModel(){
    const session = this.get('session');
    if(session.isAuthenticated){
      return session.invalidate();
    }
  }
});
