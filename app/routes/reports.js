import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ReportsRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('reports.subject');
  }
}
