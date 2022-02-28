import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SessionCopyController extends Controller {
  @service router;

  @action
  loadSession(newSession) {
    this.router.transitionTo('session', newSession.get('course'), newSession, {
      queryParams: {
        details: null,
        courseLeadershipDetails: null,
        courseObjectiveDetails: null,
        courseTaxonomyDetails: null,
        courseCompetencyDetails: null,
        courseManageLeadership: null,
        filterSessionsBy: null,
        sortSessionsBy: null,
        addOffering: null,
        sessionObjectiveDetails: null,
        sessionTaxonomyDetails: null,
        sessionLeadershipDetails: null,
        sessionManageLeadership: null,
      },
    });
  }
}
