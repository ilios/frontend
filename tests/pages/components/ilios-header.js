import {
  create,
  isPresent,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-ilios-header]',
  hasTitle: isPresent('[data-test-title]'),
  title: text('[data-test-title]'),
};

export default definition;
export const component = create(definition);
