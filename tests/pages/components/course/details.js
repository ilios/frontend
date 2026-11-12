import { clickable, count, create, isVisible } from 'ember-cli-page-object';

import collapsedCompetencies from '../collapsed-competencies';
import collapsedTaxonomies from '../collapsed-taxonomies';
import learningMaterials from '../detail-learning-materials';
import taxonomies from '../detail-taxonomies';
import leadershipCollapsed from '../leadership-collapsed';
import leadershipExpanded from '../leadership-expanded';
import meshTerms from '../mesh-terms';
import detailCohorts from './../detail-cohorts';
import header from './header';
import objectives from './objectives';
import overview from './overview';

export default create({
  scope: '[data-test-ilios-course-details]',
  hasCollapseControl: isVisible('[data-test-expand-course-details]'),
  collapseControl: clickable('[data-test-expand-course-details]'),
  titles: count('[data-test-title]'),
  header,
  overview,
  leadershipCollapsed,
  leadershipExpanded,
  objectives,
  learningMaterials,
  meshTerms,
  taxonomies,
  collapsedTaxonomies,
  detailCohorts,
  collapsedCompetencies,
});
