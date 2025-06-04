import { create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-instructor]',
  results: collection('[data-test-results] li', {
    school: text('[data-test-school]'),
    name: text('[data-test-name]'),
  }),
  hasFullResultsDownloadButton: isPresent('[data-test-results] + .download'),
};

export default definition;
export const component = create(definition);
