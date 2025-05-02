import { attribute, create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-course]',
  results: collection('[data-test-results] li', {
    school: {
      scope: '[data-test-school]',
      title: text(),
    },
    year: {
      scope: '[data-test-year]',
      title: text(),
    },
    course: {
      scope: '[data-test-title]',
      title: text(),
      link: attribute('href', 'a'),
      hasLink: isPresent('a'),
    },
  }),
  hasFullResultsDownloadButton: isPresent('[data-test-results] + .download'),
};

export default definition;
export const component = create(definition);
