import Ember from 'ember';

export default Ember.Component.extend({
  session: null,
  currentUser: Ember.inject.service(),
  userName: Ember.computed.oneWay('currentUser.model.fullName'),
  actions: {
    logout(){
      this.get('session').invalidate();
    }
  }
});
