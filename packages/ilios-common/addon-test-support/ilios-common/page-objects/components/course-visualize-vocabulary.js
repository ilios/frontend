import { attribute, collection, create, text } from 'ember-cli-page-object';
import termsChart from './visualizer-course-vocabulary';

const definition = create({
  scope: '[data-test-course-visualize-vocabulary]',
  vocabularyTitle: text('[data-test-vocabulary-title]'),
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
  termsChart,
});

export default definition;
export const component = create(definition);
