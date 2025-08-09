import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InstructorGroupRoute extends Route {
  @service currentUser;
  @service permissionChecker;
  @service session;
  @service store;
  @service dataLoader;

  queryParams = {
    showCourseAssociations: { replace: true },
  };

  canUpdate = false;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  model(params) {
    return this.dataLoader.loadInstructorGroup(params.instructor_group_id);
  }

  async afterModel(instructorGroup) {
    const permissionChecker = this.permissionChecker;
    this.canUpdate = await permissionChecker.canUpdateInstructorGroup(instructorGroup);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
