import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default class ProgramIndexRoute extends Route {
  @service permissionChecker;
  @service session;

  canCreate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async afterModel(program) {
    const permissionChecker = this.permissionChecker;
    const canCreate = await permissionChecker.canCreateProgramYear(program);
    this.set('canCreate', canCreate);

    await all([program.get('programYears'), program.get('allPublicationIssuesLength')]);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canCreate', this.canCreate);
  }
}
