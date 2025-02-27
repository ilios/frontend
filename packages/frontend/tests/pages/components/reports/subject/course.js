import { attribute, clickable, create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-course]',
  results: collection('[data-test-results] li', {
    courseTitle: text('[data-test-title]'),
    link: attribute('href', 'a'),
    hasLink: isPresent('a'),
    hasYear: isPresent('[data-test-year]'),
    year: text('[data-test-year]'),
  }),
  collapseResults: clickable('[data-test-collapse-report-extra-results]'),
  expandResults: clickable('[data-test-expand-report-extra-results]'),
  hasCollapseButton: isPresent('[data-test-collapse-report-extra-results]'),
  hasExpandButton: isPresent('[data-test-expand-report-extra-results]'),
};

export default definition;
export const component = create(definition);
