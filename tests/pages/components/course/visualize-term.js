import { create, text } from 'ember-cli-page-object';
import breadcrumbs from '../breadcrumbs';

const definition = create({
  scope: '[data-test-course-visualize-term]',
  title: text('[data-test-title]'),
  breadcrumbs,
});

export default definition;
export const component = create(definition);
