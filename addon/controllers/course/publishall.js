import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CoursePublishallController extends Controller {
  @service router;

  @action
  returnToList() {
    this.router.transitionTo('course.index', this.model, {
      queryParams: {
        details: null,
        courseLeadershipDetails: null,
        courseObjectiveDetails: null,
        courseTaxonomyDetails: null,
        courseCompetencyDetails: null,
        courseManageLeadership: null,
        filterSessionsBy: null,
        sortSessionsBy: null,
      },
    });
  }
}
