import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SessionCopyRoute extends Route {
  @service permissionChecker;
  @service session;
  @service currentUser;
  @service router;

  canUpdate = false;

  async afterModel(session) {
    this.canUpdate = await this.permissionChecker.canUpdateSession(session);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (this.session.isAuthenticated && !this.currentUser.performsNonLearnerFunction) {
      this.router.replaceWith('/four-oh-four');
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
