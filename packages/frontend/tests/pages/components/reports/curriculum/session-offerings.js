import { create, collection, text } from 'ember-cli-page-object';

import header from './header';

const definition = {
  header,
  results: collection('[data-test-report-results] [data-test-result]', {
    courseTitle: text('td', { at: 0 }),
    courseYear: text('td', { at: 1 }),
    sessionCount: text('td', { at: 2 }),
    offeringCount: text('td', { at: 3 }),
    instructorCount: text('td', { at: 4 }),
    learnerGroupCount: text('td', { at: 5 }),
  }),
  resultsMultiSchool: collection('[data-test-report-results] [data-test-result]', {
    schoolTitle: text('td', { at: 0 }),
    courseTitle: text('td', { at: 1 }),
    courseYear: text('td', { at: 2 }),
    sessionCount: text('td', { at: 3 }),
    offeringCount: text('td', { at: 4 }),
    instructorCount: text('td', { at: 5 }),
    learnerGroupCount: text('td', { at: 6 }),
  }),
};

export default definition;
export const component = create(definition);
