import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    loadSession(newSession){
      this.transitionToRoute('session', newSession.get('course'), newSession);
    }
  }
});
