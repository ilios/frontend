import { clickable, create, hasClass, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-result]',
  isActive: hasClass('active'),
  click: clickable('button'),
  canAdd: isPresent('button'),
};

export default definition;
export const component = create(definition);
