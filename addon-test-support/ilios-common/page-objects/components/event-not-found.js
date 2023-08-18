import { create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-event-not-found]',
  title: text('[data-test-title]'),
  explanation: text('[data-test-explanation]'),
  backToDashboardLink: {
    scope: '[data-test-back-to-dashboard]',
  },
};

export default definition;
export const component = create(definition);
