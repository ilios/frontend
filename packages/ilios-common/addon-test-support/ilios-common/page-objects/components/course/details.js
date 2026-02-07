import { clickable, count, create } from 'ember-cli-page-object';
import objectives from './objectives';
import learningMaterials from '../detail-learning-materials';
import meshTerms from '../mesh-terms';
import taxonomies from '../detail-taxonomies';
import collapsedTaxonomies from '../collapsed-taxonomies';
import leadershipCollapsed from '../leadership-collapsed';
import leadershipExpanded from '../leadership-expanded';
import collapsedCompetencies from '../collapsed-competencies';
import overview from './overview';
import header from './header';
import detailCohorts from './../detail-cohorts';

export default create({
  scope: '[data-test-ilios-course-details]',
  collapseControl: clickable('[data-test-expand-course-details]'),
  titles: count('.title'),
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
