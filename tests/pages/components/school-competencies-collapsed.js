import { collection, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-competencies-collapsed]',
  expandButton: {
    scope: '[data-test-expand-competencies]',
  },
  domains: collection('[data-test-domain]', {
    title: text('[data-test-domain-title]'),
    summary: text('[data-test-domain-summary]'),
  }),
};

export default definition;
export const component = create(definition);
