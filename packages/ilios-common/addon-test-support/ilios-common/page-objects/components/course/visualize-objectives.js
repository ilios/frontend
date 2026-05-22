import { create, text } from 'ember-cli-page-object';
import objectivesChart from './visualize-objectives-graph';
import breadcrumbs from '../breadcrumbs';

const definition = create({
  scope: '[data-test-course-visualize-objectives]',
  title: text('[data-test-title]'),
  breadcrumbs,
  objectivesChart,
});

export default definition;
export const component = create(definition);
