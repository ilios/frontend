import { clickable, create, collection, hasClass, isPresent, text } from 'ember-cli-page-object';
import listItem from './list-item';

const definition = {
  scope: '[data-test-instructor-groups-list]',
  items: collection('[data-test-instructor-groups-list-item]', listItem),
  isEmpty: isPresent('[data-test-empty-list]'),
  header: {
    scope: 'thead',
    title: {
      scope: 'th:nth-of-type(1)',
      isSortedAscending: hasClass('fa-sort-alpha-down', 'svg'),
      isSortedDescending: hasClass('fa-sort-alpha-down-alt', 'svg'),
      isNotSorted: hasClass('fa-sort', 'svg'),
      click: clickable('button'),
    },
    members: {
      scope: 'th:nth-of-type(2)',
      isSortedAscending: hasClass('fa-sort-numeric-down', 'svg'),
      isSortedDescending: hasClass('fa-sort-numeric-down-alt', 'svg'),
      isNotSorted: hasClass('fa-sort', 'svg'),
      click: clickable('button'),
    },
  },
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
  },
  removalConfirmationMessage: text('.confirm-removal .confirm-message'),
};

export default definition;
export const component = create(definition);
