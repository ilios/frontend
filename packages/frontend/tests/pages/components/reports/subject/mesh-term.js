import { create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-mesh-term]',
  results: collection('[data-test-results] li', {
    name: text(),
  }),
  hasFullResultsDownloadButton: isPresent('[data-test-results] + .download'),
};

export default definition;
export const component = create(definition);
