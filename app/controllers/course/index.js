import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: {
    forceFullSessionList: 'showAllSessions'
  },
  forceFullSessionList: false,
  actions: {
    setForceFullSessionsList(value){
      this.set('forceFullSessionList', value);
    }
  }
});
