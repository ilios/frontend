import { create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-competency]',
  results: collection('[data-test-results] li', {
    title: text('[data-test-title]'),
  }),
  hasFullResultsDownloadButton: isPresent('[data-test-results] + .download'),
};

export default definition;
export const component = create(definition);
