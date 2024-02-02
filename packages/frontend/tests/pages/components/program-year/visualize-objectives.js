import { attribute, collection, create } from 'ember-cli-page-object';
import treeChart from './../visualizer-program-year-objectives';

const definition = {
  scope: '[data-test-program-year-visualize-objectives]',
  title: {
    scope: '[data-test-title]',
    link: attribute('href', 'a'),
  },
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      link: attribute('href', 'a'),
    }),
  },
  treeChart,
};

export default definition;
export const component = create(definition);
