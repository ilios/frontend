import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class DashboardIndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('dashboard.week');
  }
}
