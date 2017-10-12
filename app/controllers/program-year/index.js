import Controller from '@ember/controller';
import { computed } from '@ember/object';
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
