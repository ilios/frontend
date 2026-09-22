import { create, fillable, text, value } from 'ember-cli-page-object';
import instructorsChart from './visualize-instructors-graph';
import breadcrumbs from '../breadcrumbs';

const definition = create({
  scope: '[data-test-course-visualize-instructors]',
  breadcrumbs,
  title: text('[data-test-title]'),
  filter: {
    scope: '[data-test-filter]',
    value: value('input'),
    set: fillable('input'),
  },
  instructorsChart,
});

export default definition;
export const component = create(definition);
