import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class SessionCopyController extends Controller {
  @action
  loadSession(newSession){
    this.transitionToRoute('session', newSession.get('course'), newSession);
  }
}
