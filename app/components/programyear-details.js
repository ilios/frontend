/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';

export default Component.extend({
  classNames: ['programyear-details'],
  program: null,
  programYear: null,
  canUpdate: false,
  pyObjectiveDetails: null,
  pyTaxonomyDetails: null,
  pyCompetencyDetails: null,
});
