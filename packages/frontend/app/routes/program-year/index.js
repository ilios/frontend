import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ProgramYearIndexRoute extends Route {
  @service permissionChecker;
  @service session;

  queryParams = {
    pyObjectiveDetails: { replace: true },
    pyTaxonomyDetails: { replace: true },
    pyCompetencyDetails: { replace: true },
    pyLeadershipDetails: { replace: true },
    managePyCompetencies: { replace: true },
    managePyLeadership: { replace: true },
  };

  canUpdate = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async afterModel(programYear) {
    await programYear.program;
    const permissionChecker = this.permissionChecker;
    this.canUpdate = await permissionChecker.canUpdateProgramYear(programYear);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
