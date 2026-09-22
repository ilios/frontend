import { create, fillable, text, value } from 'ember-cli-page-object';
import sessionTypesChart from './visualize-session-types-graph';
import breadcrumbs from '../breadcrumbs';

const definition = create({
  scope: '[data-test-course-visualize-session-types]',
  title: text('[data-test-title]'),
  breadcrumbs,
  filter: {
    scope: '[data-test-filter]',
    value: value('input'),
    set: fillable('input'),
  },
  sessionTypesChart,
});

export default definition;
export const component = create(definition);
