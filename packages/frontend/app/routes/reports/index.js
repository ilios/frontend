import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReportsIndexRoute extends Route {
  @service currentUser;
  @service session;
  @service router;

  beforeModel(transition) {
    if (this.currentUser.requireNonLearner(transition)) {
      this.router.replaceWith('reports.subjects');
    }
  }
}
