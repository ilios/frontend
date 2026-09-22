import { clickable, create, collection, hasClass, text } from 'ember-cli-page-object';
import listItem from './list-item';

const definition = {
  scope: '[data-test-instructor-groups-list]',
  items: collection('[data-test-instructor-groups-list-item]', listItem),
  header: {
    scope: 'thead',
    title: {
      scope: 'th:nth-of-type(1)',
      isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
      isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
      isNotSorted: hasClass('fa-sort', 'svg'),
      click: clickable('button'),
    },
    members: {
      scope: 'th:nth-of-type(2)',
      isSortedAscending: hasClass('fa-arrow-down-1-9', 'svg'),
      isSortedDescending: hasClass('fa-arrow-down-9-1', 'svg'),
      isNotSorted: hasClass('fa-sort', 'svg'),
      click: clickable('button'),
    },
    associatedCourses: {
      scope: 'th:nth-of-type(3)',
      isSortedAscending: hasClass('fa-arrow-down-1-9', 'svg'),
      isSortedDescending: hasClass('fa-arrow-down-9-1', 'svg'),
      isNotSorted: hasClass('fa-sort', 'svg'),
      click: clickable('button'),
    },
  },
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    message: text('td:first-of-type .confirm-message'),
    confirm: clickable('td:first-of-type [data-test-confirm]'),
    cancel: clickable('td:first-of-type [data-test-cancel]'),
  },
};

export default definition;
export const component = create(definition);
