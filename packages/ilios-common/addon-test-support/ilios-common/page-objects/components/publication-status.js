import { create, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-publication-status]',
  icon: {
    scope: '[data-test-icon]',
    title: text('title'),
    hasTitle: isPresent('title'),
  },
  title: {
    scope: '[data-test-text]',
  },
};

export default definition;
export const component = create(definition);
