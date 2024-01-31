import { create, collection, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-reports-subject-session-type]',
  results: collection('[data-test-results] li', {
    title: text(),
  }),
};

export default definition;
export const component = create(definition);
