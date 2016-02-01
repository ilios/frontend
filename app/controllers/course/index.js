import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: {
    sessionOffset: 'offset',
    sessionLimit: 'limit'
  },
  sessionOffset: 0,
  sessionLimit: 25,
  actions: {
    setSessionOffset(offset){
      this.set('sessionOffset', offset);
    },
    setSessionLimit(limit){
      this.set('sessionLimit', limit);
    }
  }
});
