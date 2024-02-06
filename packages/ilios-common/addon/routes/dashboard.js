import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class DashboardRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('dashboard.week');
  }
}
