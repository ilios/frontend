import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class WeeklyeventsRoute extends Route {
  @service session;

  queryParams = {
    expanded: {
      replace: true,
    },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
