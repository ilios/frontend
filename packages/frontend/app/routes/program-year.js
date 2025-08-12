import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { loadFroalaEditor } from 'ilios-common/utils/load-froala-editor';

export default class ProgramYearRoute extends Route {
  @service permissionChecker;
  @service session;
  @service store;

  canUpdate = false;

  queryParams = {
    pyObjectiveDetails: { replace: true },
    pyTaxonomyDetails: { replace: true },
    pyCompetencyDetails: { replace: true },
    pyLeadershipDetails: { replace: true },
    managePyCompetencies: { replace: true },
    managePyLeadership: { replace: true },
  };

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model(params) {
    return this.store.findRecord('program-year', params.program_year_id);
  }

  /**
   * Preload the school configurations
   * to avoid a pop in later
   */
  async afterModel(programYear) {
    const permissionChecker = this.permissionChecker;
    this.canUpdate = await permissionChecker.canUpdateProgramYear(programYear);
    //pre load froala so it's available quickly when working in the course
    loadFroalaEditor();
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
