import { create, collection, clickable, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-detail-competencies]',
  title: text('[data-test-title]'),
  collapse: clickable('[data-test-title]'),
  domains: collection('[data-test-domain]', {
    competencies: collection('[data-test-competency]'),
  }),
};

export default definition;
export const component = create(definition);
