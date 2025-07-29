import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReportsSubjectsRoute extends Route {
  @service currentUser;
  @service router;
  @service session;

  queryParams = {
    sortReportsBy: { replace: true },
    titleFilter: { replace: true },
    title: { replace: true },
    showNewReportForm: { replace: true },
    selectedSchoolId: { replace: true },
    selectedSubject: { replace: true },
    selectedPrepositionalObject: { replace: true },
    selectedPrepositionalObjectId: { replace: true },
  };

  beforeModel(transition) {
    this.currentUser.requireNonLearner(transition);
  }
}
