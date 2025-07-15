import {
  attribute,
  clickable,
  collection,
  create,
  hasClass,
  isPresent,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learner-group-course-associations]',
  header: {
    scope: '[data-test-header]',
    title: text('[data-test-title]'),
    toggle: {
      scope: '[data-test-toggle]',
      isCollapsed: isPresent('[data-icon="caret-right"]'),
      isExpanded: isPresent('[data-icon="caret-down"]'),
      ariaExpanded: attribute('aria-expanded'),
      ariaControls: attribute('aria-controls'),
      ariaLabel: attribute('aria-label'),
    },
  },
  content: {
    scope: '[data-test-content]',
    id: attribute('id'),
    isHidden: hasClass('hidden'),
    headers: {
      scope: '[data-test-associations] thead tr:nth-of-type(1)',
      school: {
        scope: 'th:nth-of-type(1)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isNotSorted: hasClass('fa-sort', 'svg'),
        sort: clickable('button'),
      },
      course: {
        scope: 'th:nth-of-type(2)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isNotSorted: hasClass('fa-sort', 'svg'),
        sort: clickable('button'),
      },
      sessions: {
        scope: 'th:nth-of-type(3)',
      },
    },
    associations: collection('[data-test-associations] tbody tr', {
      school: text('td:nth-of-type(1)'),
      course: {
        scope: 'td:nth-of-type(2)',
        link: attribute('href', 'a'),
      },
      sessions: collection('td:nth-of-type(3) [data-test-session]', {
        link: attribute('href', 'a'),
      }),
    }),
    noAssociations: {
      scope: '[data-test-no-associations]',
    },
  },
};

export default definition;
export const component = create(definition);
