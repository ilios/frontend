import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { loadQuillEditor } from 'ilios-common/utils/load-quill-editor';

export default class ProgramYearRoute extends Route {
  @service currentUser;
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
    showCohortMembers: { replace: true },
    expandedObjectives: { replace: true },
  };

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
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
    // pre-load quill so it's available quickly when working in the course
    loadQuillEditor();
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
  }
}
