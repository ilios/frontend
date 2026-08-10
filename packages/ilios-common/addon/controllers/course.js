import Controller from '@ember/controller';
import { service } from '@ember/service';

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

  details = false;
  editable = false;
  courseLeadershipDetails = false;
  courseObjectiveDetails = false;
  courseTaxonomyDetails = false;
  courseCompetencyDetails = false;
  courseManageLeadership = false;

  get showDetailsCollapseControl() {
    return this.router.currentRouteName !== 'course.publication-check';
  }
}
