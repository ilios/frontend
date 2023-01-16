import { create, collection, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-mesh-term]',
  results: collection('[data-test-results] li', {
    name: text(),
  }),
};

export default definition;
export const component = create(definition);
