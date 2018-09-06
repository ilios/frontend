import Mixin from '@ember/object/mixin';

export default Mixin.create({
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
