import Ember from 'ember';

const { Controller, inject, computed } = Ember;
const { controller } = inject;
const { alias, not } = computed;

export default Controller.extend({
  queryParams: ['pyObjectiveDetails', 'pyTaxonomyDetails', 'pyCompetencyDetails'],
  pyObjectiveDetails: false,
  pyTaxonomyDetails: false,
  pyCompetencyDetails: false,

  programYearController: controller('programYear'),
  programController: controller('program'),
  program: alias('programController.model'),
  editable: not('program.locked'),
});
