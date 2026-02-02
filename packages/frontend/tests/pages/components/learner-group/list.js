import { clickable, create, collection, hasClass, isPresent, text } from 'ember-cli-page-object';
import listItem from './list-item';

const definition = {
  scope: '[data-test-learner-group-list]',
  header: {
    scope: 'thead',
    title: {
      scope: 'th:nth-of-type(1)',
      isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
      isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
      isNotSorted: hasClass('fa-sort', 'svg'),
      click: clickable('button'),
    },
    users: {
      scope: 'th:nth-of-type(2)',
      isSortedAscending: hasClass('fa-arrow-down-1-9', 'svg'),
      isSortedDescending: hasClass('fa-arrow-down-9-1', 'svg'),
      isNotSorted: hasClass('fa-sort', 'svg'),
      click: clickable('button'),
    },
    children: {
      isSortedAscending: hasClass('fa-arrow-down-1-9', 'svg'),
      isSortedDescending: hasClass('fa-arrow-down-9-1', 'svg'),
      isNotSorted: hasClass('fa-sort', 'svg'),
      scope: 'th:nth-of-type(3)',
      click: clickable('button'),
    },
  },
  items: collection('[data-test-learner-group-list-item]', listItem),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    message: text('td:first-of-type .confirm-message'),
    confirm: clickable('td:first-of-type [data-test-confirm]'),
    cancel: clickable('td:first-of-type [data-test-cancel]'),
    canCancel: isPresent('td:first-of-type [data-test-cancel]'),
  },
  confirmCopy: {
    scope: '[data-test-confirm-copy]',
    canCopyWithLearners: isPresent('[data-test-confirm-with-learners]'),
    canCopyWithoutLearners: isPresent('[data-test-confirm-without-learners]'),
    copyWithLearners: clickable('[data-test-confirm-with-learners]'),
    copyWithoutLearners: clickable('[data-test-confirm-without-learners]'),
    cancel: clickable('[data-test-cancel]'),
  },
};

export default definition;
export const component = create(definition);
