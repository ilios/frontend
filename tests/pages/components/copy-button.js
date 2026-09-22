import { attribute, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-copy-button]',
  ariaLabel: attribute('aria-label'),
};

export default definition;
export const component = create(definition);
