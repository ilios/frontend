import { attribute, collection, create, text } from 'ember-cli-page-object';
import sessionTypeChart from './visualizer-course-session-type';

const definition = create({
  scope: '[data-test-course-visualize-session-type]',
  title: text('[data-test-title]'),
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      link: attribute('href', 'a'),
    }),
  },
  sessionTypeChart,
});

export default definition;
export const component = create(definition);
