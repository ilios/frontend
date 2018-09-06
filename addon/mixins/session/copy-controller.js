import Mixin from '@ember/object/mixin';

export default Mixin.create({
  actions: {
    loadSession(newSession){
      this.transitionToRoute('session', newSession.get('course'), newSession);
    }
  }
});
