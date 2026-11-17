import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class WeeklyeventsRoute extends Route {
  @service session;

  queryParams = {
    expanded: {
      replace: true,
    },
    week: {
      replace: true,
    },
    year: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
