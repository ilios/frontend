import { create, clickable, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-list-item]',
  title: text('[data-test-title]'),
  school: text('[data-test-school]'),
  remove: clickable('[data-test-remove]'),
  edit: clickable('[data-test-edit-program]'),
  canBeRemoved: isVisible('[data-test-remove]'),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    message: text('[data-test-message]'),
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
    resetScope: true,
  },
};

export default definition;
export const component = create(definition);
