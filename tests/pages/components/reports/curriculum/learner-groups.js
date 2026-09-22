import { create, collection, text } from 'ember-cli-page-object';

import header from './header';

const definition = {
  header,
  results: collection('[data-test-report-results] [data-test-result]', {
    courseTitle: text('td', { at: 0 }),
    sessionCount: text('td', { at: 1 }),
    instructorCount: text('td', { at: 2 }),
    learnerGroupCount: text('td', { at: 3 }),
  }),
  resultsMultiSchool: collection('[data-test-report-results] [data-test-result]', {
    schoolTitle: text('td', { at: 0 }),
    courseTitle: text('td', { at: 1 }),
    sessionCount: text('td', { at: 2 }),
    instructorCount: text('td', { at: 3 }),
    learnerGroupCount: text('td', { at: 4 }),
  }),
};

export default definition;
export const component = create(definition);
