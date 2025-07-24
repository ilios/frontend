import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReportsRoute extends Route {
  @service currentUser;
  @service router;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated && !this.currentUser.performsNonLearnerFunction) {
      // Slash on the route name is necessary here due to this bug:
      // https://github.com/emberjs/ember.js/issues/12945
      this.router.replaceWith('/four-oh-four');
    }
  }
}
