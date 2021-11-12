import { create } from 'ember-cli-page-object';
import objectives from './objectives';
import competencies from './competencies';
import detailTaxonomies from 'ilios-common/page-objects/components/detail-taxonomies';
import collapsedTaxonomies from 'ilios-common/page-objects/components/collapsed-taxonomies';

const definition = {
  scope: '[data-test-program-year-details]',
  objectives,
  competencies,
  detailTaxonomies,
  collapsedTaxonomies,
};

export default definition;
export const component = create(definition);
