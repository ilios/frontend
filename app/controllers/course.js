import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: [
    'details',
    'courseLeadershipDetails',
    'courseObjectiveDetails',
    'courseTaxonomyDetails',
    'courseCompetencyDetails',
    'courseManageLeadership',
  ],

  details: false,
  editable: false,
  courseLeadershipDetails: false,
  courseObjectiveDetails: false,
  courseTaxonomyDetails: false,
  courseCompetencyDetails: false,
  courseManageLeadership: false,
});
