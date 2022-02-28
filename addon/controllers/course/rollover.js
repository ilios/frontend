import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CourseRolloverController extends Controller {
  @service router;

  @action
  loadCourse(newCourse) {
    this.router.transitionTo('course', newCourse, {
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
