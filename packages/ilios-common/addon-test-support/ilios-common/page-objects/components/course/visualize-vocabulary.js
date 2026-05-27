import { attribute, create, text } from 'ember-cli-page-object';
import termsChart from './visualize-vocabulary-graph';
import breadcrumbs from '../breadcrumbs';

const definition = create({
  scope: '[data-test-course-visualize-vocabulary]',
  vocabularyTitle: text('[data-test-vocabulary-title]'),
  courseTitle: {
    scope: '[data-test-course-title]',
    link: attribute('href', 'a'),
  },
  breadcrumbs,
  termsChart,
});

export default definition;
export const component = create(definition);
