import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CoursePublishallRoute extends Route {
  @service session;
  @service currentUser;
  @service router;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
