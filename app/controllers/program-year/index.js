import Ember from 'ember';

const { Controller, computed } = Ember;
const { not } = computed;

export default Controller.extend({
  queryParams: [
    'pyObjectiveDetails',
    'pyTaxonomyDetails',
    'pyCompetencyDetails',
    'managePyCompetencies',
    'pyStewardDetails',
    'managePyStewards'
  ],
  pyObjectiveDetails: false,
  pyTaxonomyDetails: false,
  pyCompetencyDetails: false,
  managePyCompetencies: false,
  pyStewardDetails: false,
  managePyStewards: false,

  editable: not('model.locked'),
});
