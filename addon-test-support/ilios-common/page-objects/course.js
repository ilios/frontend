import { clickable, count, create, collection, text, visitable } from 'ember-cli-page-object';

import objectives from './components/course/objectives';
import learningMaterials from './components/learning-materials';
import meshTerms from './components/mesh-terms';
import taxonomies from './components/detail-taxonomies';
import collapsedTaxonomies from './components/collapsed-taxonomies';
import leadershipCollapsed from './components/leadership-collapsed';
import leadershipExpanded from './components/course-leadership-expanded';
import collapsedCompetencies from './components/collapsed-competencies';
import courseOverview from './components/course-overview';
import header from './components/course-header';

export default create({
  scope: '[data-test-ilios-course-details]',
  visit: visitable('/courses/:courseId'),
  collapseControl: clickable('.detail-collapsed-control'),
  titles: count('.title'),

  // header: {
  //   scope: '[data-test-course-header]',
  //   title: text('[data-test-edit]'),
  //   edit: clickable('[data-test-edit]'),
  //   set: fillable('input'),
  //   save: clickable('.done'),
  // },
  header,

  overview: courseOverview,

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
