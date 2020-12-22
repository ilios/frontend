import { collection, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-competencies-list]',
  domains: collection('[data-test-domain]', {
    title: text('[data-test-title]'),
    competencies: collection('[data-test-competency]')
  })
};

export default definition;
export const component = create(definition);
