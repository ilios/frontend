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
  visitable
} from 'ember-cli-page-object';

import { datePicker } from 'ilios/tests/helpers/date-picker';
import objectives from 'ilios/tests/pages/components/objectives';
import learningMaterials from 'ilios/tests/pages/components/learning-materials';
import meshTerms from 'ilios/tests/pages/components/mesh-terms';
import taxonomies from 'ilios/tests/pages/components/taxonomies';
import collapsedTaxonomies from 'ilios/tests/pages/components/collapsed-taxonomies';

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
    courseDirectors: {
      scope: '.coursedirectors',
      selected: collection({
        scope: '.directors',
        itemScope: 'li',
        item: {
          name: text(),
        },
      }),
      manager: {
        scope: '[data-test-course-director-manager]',
        selected: collection({
          scope: '.selected-directors',
          itemScope: 'li',
          item: {
            name: text(),
            remove: clickable(),
          },
        }),
        search: fillable('[data-test-search-box] input'),
        searchResults: collection({
          scope: '.results',
          itemScope: '[data-test-result]',
          item: {
            name: text(),
            add: clickable(),
            isActive: notHasClass('inactive'),
            inactive: hasClass('inactive'),
          },
        }),
        save: clickable('.bigadd'),
      },
      manage: clickable('.clickable'),
    },

  },

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
