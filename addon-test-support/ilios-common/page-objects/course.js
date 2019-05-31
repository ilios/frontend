import {
  clickable,
  count,
  create,
  collection,
  fillable,
  hasClass,
  isVisible,
  notHasClass,
  text,
  value,
  visitable
} from 'ember-cli-page-object';

import { datePicker } from 'ilios-common';
import objectives from './components/objectives';
import learningMaterials from './components/learning-materials';
import meshTerms from './components/mesh-terms';
import taxonomies from './components/taxonomies';
import collapsedTaxonomies from './components/collapsed-taxonomies';
import leadershipCollapsed from './components/leadership-collapsed';
import leadershipList from './components/leadership-list';
import leadershipManager from './components/leadership-manager';

export default create({
  scope: '[data-test-ilios-course-details]',
  visit: visitable('/courses/:courseId'),
  collapseControl: clickable('.detail-collapsed-control'),
  titles: count('.title'),

  header: {
    scope: '[data-test-course-header]',
    title: text('[data-test-edit]'),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done')
  },

  overview: {
    scope: '[data-test-course-overview]',
    rollover: {
      scope: 'span.rollover',
      visit: clickable(),
      visible: isVisible()
    },
    externalId: {
      scope: '.courseexternalid',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: fillable('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    startDate: {
      scope: '.coursestartdate',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: datePicker('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    endDate: {
      scope: '.courseenddate',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: datePicker('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    level: {
      scope: '.courselevel',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: fillable('select'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    universalLocator: text('.universallocator'),
    clerkshipType: {
      scope: '.clerkshiptype',
      value: text('span', { at: 0}),
      edit: clickable('[data-test-edit]'),
      set: fillable('select'),
      save: clickable('.done')
    },
  },

  leadershipCollapsed,
  leadershipExpanded: {
    scope: '[data-test-course-leadership-expanded]',
    title: text('.title'),
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    leadershipList,
    leadershipManager,
  },
  objectives,
  learningMaterials,
  meshTerms,
  taxonomies,
  collapsedTaxonomies,

  objectiveParentManager: {
    scope: '[data-test-course-objective-manager]',
    title: text('.objectivetitle'),
    groupTitle: text('.group-picker'),
    selectGroup: fillable('.group-picker select'),
    groups: collection('.group-picker select option', {
      title: text(),
      value: value(),
    }),
    competencies: collection('.parent-picker [data-test-competency]', {
      title: text('.competency-title'),
      selected: hasClass('selected', '.competency-title'),
      notSelected: notHasClass('selected', '.competency-title'),
      objectives: collection('ul li', {
        title: text(),
        selected: hasClass('selected'),
        notSelected: notHasClass('selected'),
        add: clickable('input')
      }),
    }),
  },

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
});
