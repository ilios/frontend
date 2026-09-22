import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CourseRolloverRoute extends Route {
  @service currentUser;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
