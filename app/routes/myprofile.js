import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class MyprofileRoute extends Route {
  @service currentUser;
  @service session;
  @service dataLoader;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model() {
    return this.dataLoader.loadUserProfile(this.currentUser.currentUserId);
  }
}
