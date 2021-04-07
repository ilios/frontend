import { create, attribute } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-toggle-yesno]',
  handle: {
    scope: '[data-test-handle]',
  },
  label: {
    scope: '[data-test-label]',
  },
  checked: attribute('aria-checked'),
};

export default definition;
export const component = create(definition);
