import { clickable, create, collection, hasClass, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learnergroup-list]',
  title: text('[data-test-title]'),
  headings: collection('thead th', {
    title: text(),
  }),
  sortByTitle: clickable('thead th:eq(0) button'),
  isSortedByTitleAscending: hasClass('fa-arrow-down-a-z', 'thead th:eq(0) svg'),
  isSortedByTitleDescending: hasClass('fa-arrow-down-z-a', 'thead th:eq(0) svg'),
  isNotSortedByTitle: hasClass('fa-sort', 'thead th:eq(0) svg'),
  sortByMembers: clickable('thead th:eq(1) button'),
  isSortedByMembersAscending: hasClass('fa-arrow-down-1-9', 'thead th:eq(1) svg'),
  isSortedByMembersDescending: hasClass('fa-arrow-down-9-1', 'thead th:eq(1) svg'),
  isNotSortedByMembers: hasClass('fa-sort', 'thead th:eq(1) svg'),
  sortBySubgroups: clickable('thead th:eq(2) button'),
  isSortedBySubgroupsAscending: hasClass('fa-arrow-down-1-9', 'thead th:eq(2) svg'),
  isSortedBySubgroupsDescending: hasClass('fa-arrow-down-9-1', 'thead th:eq(2) svg'),
  isNotSortedBySubgroups: hasClass('fa-sort', 'thead th:eq(2) svg'),
  groups: collection('tbody tr', {
    title: text('td:nth-of-type(1) [data-test-title]'),
    needsAccommodation: isPresent('td:nth-of-type(1) [data-icon="universal-access"]'),
    visit: clickable('td:nth-of-type(1) a'),
    members: text('td', { at: 1 }),
    subgroups: text('td:nth-of-type(3) [data-test-children-count]'),
    hasSubgroupsInNeedOfAccommodation: isPresent(
      'td:nth-of-type(3) [data-icon="universal-access"]'
    ),
    courses: text('td', { at: 3 }),
    hasRemoveStyle: hasClass('confirm-removal'),
    actions: {
      scope: '[data-test-actions]',
      canRemove: isPresent('[data-test-remove]'),
      remove: clickable('[data-test-remove]'),
      canCopy: isPresent('[data-test-copy]'),
      copy: clickable('[data-test-copy]'),
    },
  }),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
    canConfirm: isPresent('[data-test-confirm]'),
    canCancel: isPresent('[data-test-cancel]'),
    confirmation: text('[data-test-confirmation]'),
  },
  confirmCopy: {
    scope: '[data-test-confirm-copy]',
    confirmWithLearners: clickable('[data-test-confirm-with-learners]'),
    confirmWithoutLearners: clickable('[data-test-confirm-without-learners]'),
    canCopyWithLearners: isPresent('[data-test-confirm-with-learners]'),
    canCopyWithoutLearners: isPresent('[data-test-confirm-without-learners]'),
  },
};

export default definition;
export const component = create(definition);
