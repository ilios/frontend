import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class InstructorGroupRoute extends Route {
  @service permissionChecker;
  @service session;
  @service store;
  @service dataLoader;

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.dataLoader.loadInstructorGroup(params.instructor_group_id);
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
