import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SchoolsRoute extends Route {
  @service currentUser;
  @service store;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  model() {
    return this.store.findAll('school');
  }
}
