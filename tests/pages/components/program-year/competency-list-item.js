import { collection, create, hasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-year-competency-list-item]',
  title: text('[data-test-title]'),
  isActive: hasClass('active', '[data-test-domain-title]'),
  competencies: collection('[data-test-competency]'),
};

export default definition;
export const component = create(definition);
