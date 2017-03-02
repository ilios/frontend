import Ember from 'ember';

const { service }  = Ember.inject;

export default Ember.Route.extend({
  session: service(),
  titleToken: 'general.logout',
  beforeModel(){
    const session = this.get('session');
    if(session.isAuthenticated){
      return session.invalidate();
    }
  }
});
