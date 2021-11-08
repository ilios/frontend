import { create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-session-publicationcheck]',
  title: text('[data-test-title]'),
  backToSession: {
    scope: '[data-test-back-to-session]',
  },
  sessionTitle: text('[data-test-session-title]'),
  offerings: text('[data-test-offerings]'),
  terms: text('[data-test-terms]'),
  objectives: text('[data-test-objectives]'),
  unlink: {
    scope: '[data-test-unlink]',
  },
  mesh: text('[data-test-mesh]'),
};

export default definition;
export const component = create(definition);
