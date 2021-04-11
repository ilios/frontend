import { clickable, create, collection, isPresent, text } from 'ember-cli-page-object';
import listItem from './list-item';

const definition = {
  scope: '[data-test-instructor-groups-list]',
  items: collection('[data-test-instructor-groups-list-item]', listItem),
  isEmpty: isPresent('[data-test-empty-list]'),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
  },
  removalConfirmationMessage: text('.confirm-removal .confirm-message'),
};

export default definition;
export const component = create(definition);
