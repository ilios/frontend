import { attribute, collection, create, text } from 'ember-cli-page-object';
import termsChart from './visualize-instructor-term-graph';
import sessionTypesChart from './visualize-instructor-session-type-graph';

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
