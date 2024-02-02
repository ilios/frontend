import { attribute, collection, create, text } from 'ember-cli-page-object';
import objectivesChart from './visualizer-course-objectives';

const definition = create({
  scope: '[data-test-course-visualize-objectives]',
  title: text('[data-test-title]'),
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      link: attribute('href', 'a'),
    }),
  },
  objectivesChart,
});

export default definition;
export const component = create(definition);
