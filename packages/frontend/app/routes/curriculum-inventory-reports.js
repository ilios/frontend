import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CurriculumInventoryReportsRoute extends Route {
  @service currentUser;
  @service store;
  @service session;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  async model() {
    return this.store.findAll('school');
  }
}
