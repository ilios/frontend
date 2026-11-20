import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CourseController extends Controller {
  @service router;

  queryParams = [
    'details',
    'courseLeadershipDetails',
    'courseObjectiveDetails',
    'courseTaxonomyDetails',
    'courseCompetencyDetails',
    'courseManageLeadership',
  ];

  editable = false;

  @tracked details = false;
  @tracked courseLeadershipDetails = false;
  @tracked courseObjectiveDetails = false;
  @tracked courseTaxonomyDetails = false;
  @tracked courseCompetencyDetails = false;
  @tracked courseManageLeadership = false;

  get showDetailsCollapseControl() {
    return this.router.currentRouteName !== 'course.publication-check';
  }
}
