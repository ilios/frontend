import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SchoolsRoute extends Route {
  @service store;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model() {
    return this.store.findAll('school');
  }
}
