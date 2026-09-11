import { attribute, create, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-big-add-cancel-buttons]',
  addButton: {
    scope: '[data-test-add]',
    cssClasses: attribute('class'),
    ariaLabel: attribute('aria-label'),
    isDisabled: property('disabled'),
  },
  cancelButton: {
    scope: '[data-test-cancel]',
    cssClasses: attribute('class'),
    ariaLabel: attribute('aria-label'),
    isDisabled: property('disabled'),
  },
};

export default definition;
export const component = create(definition);
