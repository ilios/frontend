import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: [
    'pyObjectiveDetails',
    'pyTaxonomyDetails',
    'pyCompetencyDetails',
    'managePyCompetencies',
  ],
  canUpdate: false,
  pyObjectiveDetails: false,
  pyTaxonomyDetails: false,
  pyCompetencyDetails: false,
  managePyCompetencies: false,
});
