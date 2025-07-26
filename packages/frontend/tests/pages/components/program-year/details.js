import { create } from 'ember-cli-page-object';
import objectives from './objectives';
import competencies from './competencies';
import courseAssociations from './course-associations';
import expandedLeadership from 'ilios-common/page-objects/components/leadership-expanded';
import detailTaxonomies from 'ilios-common/page-objects/components/detail-taxonomies';
import collapsedTaxonomies from 'ilios-common/page-objects/components/collapsed-taxonomies';
import collapsedLeadership from 'ilios-common/page-objects/components/leadership-collapsed';

const definition = {
  scope: '[data-test-program-year-details]',
  objectives,
  competencies,
  detailTaxonomies,
  collapsedTaxonomies,
  expandedLeadership,
  collapsedLeadership,
  courseAssociations,
};

export default definition;
export const component = create(definition);
