import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CurriculumInventoryReportsRoute extends Route {
  @service currentUser;
  @service store;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    return this.store.findAll('school');
  }
}
