import Mixin from '@ember/object/mixin';
import { action } from '@ember/object';

export default Mixin.create({
  @action
  loadSession(newSession){
    this.transitionToRoute('session', newSession.get('course'), newSession);
  }
});
