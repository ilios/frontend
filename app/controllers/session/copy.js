import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  actions: {
    loadSession(newSession){
      this.transitionToRoute('session', newSession.get('course'), newSession);
    }
  }
});
