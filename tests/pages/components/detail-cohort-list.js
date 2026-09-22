import { collection, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-detail-cohort-list]',
  header: {
    scope: 'thead tr:nth-of-type(1)',
    school: text('th:nth-of-type(1)'),
    program: text('th:nth-of-type(2)'),
    cohort: text('th:nth-of-type(3)'),
  },
  cohorts: collection('tbody tr', {
    school: text('td:nth-of-type(1)'),
    program: text('td:nth-of-type(2)'),
    cohort: text('td:nth-of-type(3)'),
  }),
};

export default definition;
export const component = create(definition);
