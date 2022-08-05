import { attribute, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-year-overview]',
  title: text('[data-test-title]'),
  actions: {
    scope: '[data-test-actions]',
    visualizations: {
      scope: '[data-test-go-to-visualizations]',
      url: attribute('href'),
    },
  },
};

export default definition;
export const component = create(definition);
