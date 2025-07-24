import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReportsIndexRoute extends Route {
  @service currentUser;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated && !this.currentUser.performsNonLearnerFunction) {
      // Slash on the route name is necessary here due to this bug:
      // https://github.com/emberjs/ember.js/issues/12945
      this.router.replaceWith('/four-oh-four');
    }
    this.router.replaceWith('reports.subjects');
  }
}
