import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CourseRolloverRoute extends Route {
  @service session;
  @service currentUser;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated && !this.currentUser.performsNonLearnerFunction) {
      this.router.replaceWith('/four-oh-four');
    }
  }
}
