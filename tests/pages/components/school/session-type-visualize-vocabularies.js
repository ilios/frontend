import { attribute, create, text } from 'ember-cli-page-object';
import vocabulariesChart from './visualize-session-type-vocabularies-graph';

const definition = create({
  scope: '[data-test-school-session-type-visualize-vocabularies]',
  backToSchool: {
    scope: '[data-test-back-to-school]',
    url: attribute('href', 'a'),
  },
  primaryTitle: text('[data-test-primary-title]'),
  secondaryTitle: text('[data-test-secondary-title]'),
  vocabulariesChart,
});

export default definition;
export const component = create(definition);
