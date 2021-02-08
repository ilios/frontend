import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class InstructorGroupRoute extends Route {
  @service permissionChecker;
  @service session;

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async afterModel(instructorGroup) {
    const permissionChecker = this.permissionChecker;
    const canUpdate = await permissionChecker.canUpdateInstructorGroup(instructorGroup);
    this.set('canUpdate', canUpdate);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
