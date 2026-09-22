import { attribute, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-back-to-courses]',
  url: attribute('href', 'a'),
};

export default definition;
export const component = create(definition);
