import {
  attribute,
  clickable,
  collection,
  create,
  hasClass,
  isPresent,
  text,
} from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import userStatus from 'ilios-common/page-objects/components/user-status';

const definition = {
  scope: '[data-test-program-year-cohort-members]',
  header: {
    scope: '[data-test-header]',
    title: text('[data-test-title]'),
    toggle: {
      scope: '[data-test-toggle]',
      isCollapsed: isPresent('[data-icon="caret-right"]'),
      isExpanded: isPresent('[data-icon="caret-down"]'),
      ariaExpanded: attribute('aria-expanded'),
      ariaControls: attribute('aria-controls'),
    },
  },
  content: {
    scope: '[data-test-content]',
    id: attribute('id'),
    isHidden: hasClass('hidden'),
    headers: {
      scope: '[data-test-members] thead tr:nth-of-type(1)',
      member: {
        scope: 'th:nth-of-type(1)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isNotSorted: hasClass('fa-sort', 'svg'),
        sort: clickable('button'),
      },
    },
    members: collection('[data-test-members] tbody tr', {
      member: {
        scope: 'td:nth-of-type(1)',
        link: attribute('href', 'a'),
        userStatus,
        userNameInfo,
      },
    }),
  },
};

export default definition;
export const component = create(definition);
