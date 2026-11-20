import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CoursePublishallController extends Controller {
  @service router;

  queryParams = [
    'expandCompleteSessions',
    'expandIncompleteSessions',
    'sortIncompleteBy',
    'sortCompleteBy',
    'sortUnpublishedBy',
  ];

  @tracked expandCompleteSessions = false;
  @tracked expandIncompleteSessions = false;
  @tracked sortIncompleteBy = 'title';
  @tracked sortCompleteBy = 'title';
  @tracked sortUnpublishedBy = 'title';

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
