import { attribute, collection, create, text } from 'ember-cli-page-object';
import termsChart from './visualizer-course-instructor-term';
import sessionTypesChart from './visualizer-course-instructor-session-type';

const definition = create({
  scope: '[data-test-course-visualize-instructor]',
  title: text('[data-test-title]'),
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      link: attribute('href', 'a'),
    }),
  },
  instructorName: text('[data-test-instructor-name]'),
  totalOfferingsTime: text('[data-test-total-offerings-time]'),
  totalIlmTime: text('[data-test-total-ilm-time]'),
  termsChart,
  sessionTypesChart,
});

export default definition;
export const component = create(definition);
