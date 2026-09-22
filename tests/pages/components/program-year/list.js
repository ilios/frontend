import { clickable, create, collection, hasClass } from 'ember-cli-page-object';
import listItem from './list-item';
import newProgramYear from './new';

const definition = {
  scope: '[data-test-program-year-list]',
  items: collection('[data-test-program-year-list-item]', listItem),
  header: {
    scope: 'thead',
    startYear: {
      scope: 'th:nth-of-type(1)',
      isSortedAscending: hasClass('fa-arrow-down-1-9', 'svg'),
      isSortedDescending: hasClass('fa-arrow-down-9-1', 'svg'),
      click: clickable('button'),
    },
  },
  newProgramYear,
  expandCollapse: {
    scope: '[data-test-expand-collapse-button]',
    toggle: clickable('button'),
  },
};

export default definition;
export const component = create(definition);
