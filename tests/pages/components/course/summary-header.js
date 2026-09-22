import { count, create, text, isPresent } from 'ember-cli-page-object';
const definition = {
  scope: '[data-test-course-summary-header]',
  title: text('[data-test-title]'),
  academicYear: text('[data-test-academic-year]'),
  actions: {
    scope: '[data-test-actions]',
    count: count('a'),
    canPrint: isPresent('[data-test-print]'),
    canRollover: isPresent('[data-test-rollover]'),
  },
  start: text('[data-test-start] span'),
  externalId: text('[data-test-external-id] span'),
  end: text('[data-test-end] span'),
  level: text('[data-test-level] span'),
  status: text('[data-test-publication-status] [data-test-text]'),
};

export default definition;
export const component = create(definition);
