import {
  attribute,
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
    title: text('.editable'),
    edit: clickable('.clickable'),
    set: fillable('input'),
    save: clickable('.done')
  },

  overview: {
    scope: '[data-test-course-overview]',
    rollover: {
      scope: 'a.rollover',
      visit: clickable(),
      link: attribute('href'),
      visible: isVisible(),
    },
    externalId: {
      scope: '.courseexternalid',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: fillable('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    startDate: {
      scope: '.coursestartdate',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: datePicker('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    endDate: {
      scope: '.courseenddate',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: datePicker('input'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    level: {
      scope: '.courselevel',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
      set: fillable('select'),
      save: clickable('.done'),
      hasError: isVisible('.validation-error-message')
    },
    universalLocator: text('.universallocator'),
    clerkshipType: {
      scope: '.clerkshiptype',
      value: text('span', { at: 0}),
      edit: clickable('.clickable'),
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
    groups: collection({
      scope: '.group-picker select',
      itemScope: 'option',
      item: {
        title: text(),
        value: value(),
      },
    }),
    competencies: collection({
      scope: '.parent-picker',
      itemScope: '[data-test-competency]',
      item: {
        title: text('.competency-title'),
        selected: hasClass('selected', '.competency-title'),
        notSelected: notHasClass('selected', '.competency-title'),
        objectives: collection({
          scope: 'ul',
          itemScope: 'li',
          item: {
            title: text(),
            selected: hasClass('selected'),
            notSelected: notHasClass('selected'),
            add: clickable('input')
          }
        }),
      }
    }),
  },

  cohorts: {
    scope: '[data-test-detail-cohorts]',
    manage: clickable('.actions button'),
    save: clickable('.actions button.bigadd'),
    cancel: clickable('.actions button.bigcancel'),
    current: collection({
      scope: 'table',
      itemScope: 'tbody tr',
      item: {
        school: text('td', { at: 0 }),
        program: text('td', { at: 1 }),
        cohort: text('td', { at: 2 }),
        level: text('td', { at: 3 }),
      },
    }),
    selected: collection({
      scope: '.selected-cohorts',
      itemScope: 'li',
      item: {
        name: text(),
        remove: clickable(),
      },
    }),
    selectable: collection({
      scope: '.selectable-cohorts',
      itemScope: 'li',
      item: {
        name: text(),
        add: clickable(),
      },
    }),
  },
});
