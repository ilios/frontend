import { attribute, collection, create, fillable, text, value } from 'ember-cli-page-object';
import instructorsChart from './visualizer-course-instructors';

const definition = create({
  scope: '[data-test-course-visualize-instructors]',
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      link: attribute('href', 'a'),
    }),
  },
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
