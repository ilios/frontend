import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['details', 'courseObjectiveDetails', 'courseTaxonomyDetails', 'courseCompetencyDetails'],

  details: false,
  courseObjectiveDetails: false,
  courseTaxonomyDetails: false,
  courseCompetencyDetails: false,
});
