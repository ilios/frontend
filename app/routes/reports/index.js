import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ReportsIndexRoute extends Route {
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    this.router.replaceWith('reports.subjects');
  }
}
