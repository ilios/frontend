import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: [
    'pyObjectiveDetails',
    'pyTaxonomyDetails',
    'pyCompetencyDetails',
    'managePyCompetencies',
    'pyStewardDetails',
    'managePyStewards'
  ],
  canUpdate: false,
  pyObjectiveDetails: false,
  pyTaxonomyDetails: false,
  pyCompetencyDetails: false,
  managePyCompetencies: false,
  pyStewardDetails: false,
  managePyStewards: false,
});
