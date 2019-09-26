import {
  create,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-verification-preview-header]',
  title: text('[data-test-title]'),
};
export default definition;
export const component = create(definition);
