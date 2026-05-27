import { attribute, create } from 'ember-cli-page-object';
import breadcrumbs from 'ilios-common/page-objects/components/breadcrumbs';
import treeChart from './../visualizer-program-year-objectives';

const definition = {
  scope: '[data-test-program-year-visualize-objectives]',
  title: {
    scope: '[data-test-title]',
    link: attribute('href', 'a'),
  },
  breadcrumbs,
  treeChart,
};

export default definition;
export const component = create(definition);
