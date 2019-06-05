import {
  clickable,
  create,
  collection,
  isPresent,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learnergroup-list]',
  title: text('[data-test-title]'),
  headings: collection('thead th', {
    title: text(),
  }),
  groups: collection('tbody tr', {
    title: text('td', { at: 0 }),
    members: text('td', { at: 1 }),
    subgroups: text('td', { at: 2 }),
    courses: text('td', { at: 3 }),
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
