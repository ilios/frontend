import { clickable, create, collection, isPresent, text } from 'ember-cli-page-object';
import listItem from './list-item';

const definition = {
  scope: '[data-test-learner-groups-list]',
  items: collection('[data-test-learner-groups-list-item]', listItem),
  isEmpty: isPresent('[data-test-empty-list]'),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
    canCancel: isPresent('[data-test-cancel]'),
  },
  confirmCopy: {
    scope: '[data-test-confirm-copy]',
    canCopyWithLearners: isPresent('[data-test-confirm-with-learners]'),
    canCopyWithoutLearners: isPresent('[data-test-confirm-without-learners]'),
    copyWithLearners: clickable('[data-test-confirm-with-learners]'),
    copyWithoutLearners: clickable('[data-test-confirm-without-learners]'),
    cancel: clickable('[data-test-cancel]'),
  },
  removalConfirmationMessage: text('.confirm-removal .confirm-message'),
};

export default definition;
export const component = create(definition);
