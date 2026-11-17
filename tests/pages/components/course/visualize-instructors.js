import { create, fillable, text, value } from 'ember-cli-page-object';

import breadcrumbs from '../breadcrumbs';
import instructorsChart from './visualize-instructors-graph';

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
