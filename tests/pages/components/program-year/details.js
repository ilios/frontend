import { create } from 'ember-cli-page-object';
import collapsedTaxonomies from 'frontend/tests/pages/components/collapsed-taxonomies';
import detailTaxonomies from 'frontend/tests/pages/components/detail-taxonomies';
import collapsedLeadership from 'frontend/tests/pages/components/leadership-collapsed';
import expandedLeadership from 'frontend/tests/pages/components/leadership-expanded';

import cohortMembers from './cohort-members';
import competencies from './competencies';
import courseAssociations from './course-associations';
import objectives from './objectives';

const definition = {
  scope: '[data-test-program-year-details]',
  objectives,
  competencies,
  detailTaxonomies,
  collapsedTaxonomies,
  expandedLeadership,
  collapsedLeadership,
  courseAssociations,
  cohortMembers,
};

export default definition;
export const component = create(definition);
