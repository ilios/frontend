import { create } from 'ember-cli-page-object';
import objectives from './objectives';
import competencies from './competencies';
import courseAssociations from './course-associations';
import cohortMembers from './cohort-members';
import expandedLeadership from 'frontend/tests/pages/components/leadership-expanded';
import detailTaxonomies from 'frontend/tests/pages/components/detail-taxonomies';
import collapsedTaxonomies from 'frontend/tests/pages/components/collapsed-taxonomies';
import collapsedLeadership from 'frontend/tests/pages/components/leadership-collapsed';

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
