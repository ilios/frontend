import CommonDashboardIndexRoute from 'ilios-common/routes/dashboard/index';
import { inject as service } from '@ember/service';

export default class DashboardIndexRoute extends CommonDashboardIndexRoute {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login-error');
    super.beforeModel(transition);
  }
}
