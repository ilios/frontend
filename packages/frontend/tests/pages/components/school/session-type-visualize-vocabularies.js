import { attribute, collection, create, text } from 'ember-cli-page-object';
import vocabulariesChart from './visualize-session-type-vocabularies-graph';

const definition = create({
  scope: '[data-test-school-session-type-visualize-vocabularies]',
  primaryTitle: text('[data-test-primary-title]'),
  secondaryTitle: text('[data-test-secondary-title]'),
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      link: attribute('href', 'a'),
    }),
  },
  vocabulariesChart,
});

export default definition;
export const component = create(definition);
