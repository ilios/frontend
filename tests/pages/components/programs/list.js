import { clickable, create, collection, isPresent } from 'ember-cli-page-object';
import listItem from './list-item';

const definition = {
  scope: '[data-test-program-list]',
  items: collection('[data-test-program-list-item]', listItem),
  isEmpty: isPresent('[data-test-empty-list]'),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
  },
};

export default definition;
export const component = create(definition);
