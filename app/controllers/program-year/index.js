import Ember from 'ember';

const { Controller, inject, computed } = Ember;
const { controller } = inject;
const { alias, not } = computed;

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

  programYearController: controller('programYear'),
  programController: controller('program'),
  program: alias('programController.model'),
  editable: not('model.locked'),
});
