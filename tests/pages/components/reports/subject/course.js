import { attribute, clickable, create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-course]',
  download: clickable('[data-test-download]'),
  results: collection('[data-test-results] li', {
    courseTitle: text('[data-test-title]'),
    link: attribute('href', 'a'),
    hasLink: isPresent('a'),
    hasYear: isPresent('[data-test-year]'),
    year: text('[data-test-year]'),
  }),
};

export default definition;
export const component = create(definition);
