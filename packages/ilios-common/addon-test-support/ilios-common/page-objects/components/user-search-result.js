import { clickable, create, hasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-result]',
  isActive: hasClass('active'),
  click: clickable('button'),
};

export default definition;
export const component = create(definition);
