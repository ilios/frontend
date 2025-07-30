import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class WeeklyeventsRoute extends Route {
  @service session;

  queryParams = {
    expanded: {
      replace: true,
    },
    week: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
