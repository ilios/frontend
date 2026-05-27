import { attribute, create } from 'ember-cli-page-object';
import vocabulariesChart from './visualize-vocabularies-graph';
import breadcrumbs from '../breadcrumbs';

const definition = create({
  scope: '[data-test-course-visualize-vocabularies]',
  courseTitle: {
    scope: '[data-test-course-title]',
    link: attribute('href', 'a'),
  },
  breadcrumbs,
  vocabulariesChart,
});

export default definition;
export const component = create(definition);
