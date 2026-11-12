import { create, text } from 'ember-cli-page-object';

import breadcrumbs from '../breadcrumbs';
import sessionTypesChart from './visualize-instructor-session-type-graph';
import termsChart from './visualize-instructor-term-graph';

const definition = create({
  scope: '[data-test-course-visualize-instructor]',
  title: text('[data-test-title]'),
  breadcrumbs,
  instructorName: text('[data-test-instructor-name]'),
  totalOfferingsTime: text('[data-test-total-offerings-time]'),
  totalIlmTime: text('[data-test-total-ilm-time]'),
  termsChart,
  sessionTypesChart,
});

export default definition;
export const component = create(definition);
