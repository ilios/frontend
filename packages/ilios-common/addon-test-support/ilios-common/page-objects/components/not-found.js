import { create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-not-found]',
  backToDashboardLink: {
    scope: '[data-test-back-to-dashboard]',
  },
};

export default definition;
export const component = create(definition);
