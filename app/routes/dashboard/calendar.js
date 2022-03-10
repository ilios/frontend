import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class DashboardCalendarRoute extends Route {
  @service session;
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
