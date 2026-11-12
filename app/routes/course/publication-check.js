import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CoursePublicationCheckRoute extends Route {
  @service currentUser;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
