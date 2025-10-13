import { attribute, collection, create, fillable, text, value } from 'ember-cli-page-object';
import sessionTypeChart from './visualize-session-type-graph';

const definition = create({
  scope: '[data-test-course-visualize-session-type]',
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
  sessionTypeChart,
});

export default definition;
export const component = create(definition);
