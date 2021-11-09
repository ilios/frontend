import { create, hasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-result]',
  isActive: hasClass('active'),
};

export default definition;
export const component = create(definition);
