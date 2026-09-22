import { attribute, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-year-overview]',
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
