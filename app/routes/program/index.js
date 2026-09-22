import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ProgramIndexRoute extends Route {
  @service currentUser;
  @service permissionChecker;

  canCreate = false;

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }

  async afterModel(program) {
    const permissionChecker = this.permissionChecker;
    this.canCreate = await permissionChecker.canCreateProgramYear(program);

    await Promise.all([program.get('programYears'), program.get('allPublicationIssuesLength')]);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canCreate', this.canCreate);
  }
}
