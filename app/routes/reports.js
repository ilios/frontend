import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ReportsRoute extends Route {
  @service store;
  @service currentUser;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
