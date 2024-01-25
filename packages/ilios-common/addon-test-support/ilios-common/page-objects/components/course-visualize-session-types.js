import { attribute, collection, create, fillable, text, value } from 'ember-cli-page-object';
import sessionTypesChart from './visualizer-course-session-types';

const definition = create({
  scope: '[data-test-course-visualize-session-types]',
  title: text('[data-test-title]'),
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      link: attribute('href', 'a'),
    }),
  },
  filter: {
    scope: '[data-test-filter]',
    value: value('input'),
    set: fillable('input'),
  },
  sessionTypesChart,
});

export default definition;
export const component = create(definition);
