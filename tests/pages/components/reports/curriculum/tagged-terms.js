import { create, collection, text } from 'ember-cli-page-object';

import header from './header';

const definition = {
  header,
  results: collection('[data-test-report-results] [data-test-result]', {
    courseTitle: text('td', { at: 0 }),
    courseTermsCount: text('td', { at: 1 }),
    sessionCount: text('td', { at: 2 }),
    sessionTermsCount: text('td', { at: 3 }),
  }),
  resultsMultiSchool: collection('[data-test-report-results] [data-test-result]', {
    schoolTitle: text('td', { at: 0 }),
    courseTitle: text('td', { at: 1 }),
    courseTermsCount: text('td', { at: 2 }),
    sessionCount: text('td', { at: 3 }),
    sessionTermsCount: text('td', { at: 4 }),
  }),
};

export default definition;
export const component = create(definition);
