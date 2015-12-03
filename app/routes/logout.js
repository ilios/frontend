import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(){
    const session = this.get('session');
    if(session.isAuthenticated){
      return session.invalidate();
    }
  }
});
