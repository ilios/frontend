import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReportsSubjectsRoute extends Route {
  @service currentUser;
  @service router;
  @service session;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
