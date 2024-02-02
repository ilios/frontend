import { attribute, clickable, create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-session]',
  download: clickable('[data-test-download]'),
  results: collection('[data-test-results] li', {
    courseTitle: text('[data-test-course-title]'),
    sessionTitle: text('[data-test-session-title]'),
    courseLink: attribute('href', '[data-test-course-title] a'),
    sessionLink: attribute('href', '[data-test-session-title] a'),
    hasCourseLink: isPresent('[data-test-course-title] a'),
    hasSessionLink: isPresent('[data-test-session-title] a'),
    hasYear: isPresent('[data-test-year]'),
    year: text('[data-test-year]'),
  }),
};

export default definition;
export const component = create(definition);
