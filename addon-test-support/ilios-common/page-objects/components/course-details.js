import { clickable, count, create, collection, text, visitable } from 'ember-cli-page-object';
import objectives from './course/objectives';
import learningMaterials from './learning-materials';
import meshTerms from './mesh-terms';
import taxonomies from './detail-taxonomies';
import collapsedTaxonomies from './collapsed-taxonomies';
import leadershipCollapsed from './leadership-collapsed';
import leadershipExpanded from './course-leadership-expanded';
import collapsedCompetencies from './collapsed-competencies';
import overview from './course-overview';
import header from './course-header';

export default create({
  scope: '[data-test-ilios-course-details]',
  visit: visitable('/courses/:courseId'),
  collapseControl: clickable('.detail-collapsed-control'),
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
  cohorts: {
    scope: '[data-test-detail-cohorts]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    current: collection('table tbody tr', {
      school: text('td', { at: 0 }),
      program: text('td', { at: 1 }),
      cohort: text('td', { at: 2 }),
      level: text('td', { at: 3 }),
    }),
    selected: collection('.selected-cohorts li', {
      name: text(),
      remove: clickable(),
    }),
    selectable: collection('.selectable-cohorts li', {
      name: text(),
      add: clickable(),
    }),
  },
  collapsedCompetencies,
});
