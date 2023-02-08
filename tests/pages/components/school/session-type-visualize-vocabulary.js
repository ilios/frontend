import { attribute, collection, create, text } from 'ember-cli-page-object';
import termsChart from './visualizer-session-type-vocabulary';

const definition = create({
  scope: '[data-test-school-session-type-visualize-vocabulary]',
  primaryTitle: text('[data-test-primary-title]'),
  secondaryTitle: text('[data-test-secondary-title]'),
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      link: attribute('href', 'a'),
    }),
  },
  termsChart,
});

export default definition;
export const component = create(definition);
