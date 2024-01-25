import { attribute, collection, create } from 'ember-cli-page-object';
import vocabulariesChart from './visualizer-course-vocabularies';

const definition = create({
  scope: '[data-test-course-visualize-vocabularies]',
  courseTitle: {
    scope: '[data-test-course-title]',
    link: attribute('href', 'a'),
  },
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
