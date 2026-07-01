import Controller from '@ember/controller';

export default class CourseController extends Controller {
  queryParams = [
    'details',
    'detailsCollapseControl',
    'courseLeadershipDetails',
    'courseObjectiveDetails',
    'courseTaxonomyDetails',
    'courseCompetencyDetails',
    'courseManageLeadership',
  ];

  details = false;
  detailsCollapseControl = true;
  editable = false;
  courseLeadershipDetails = false;
  courseObjectiveDetails = false;
  courseTaxonomyDetails = false;
  courseCompetencyDetails = false;
  courseManageLeadership = false;
}
