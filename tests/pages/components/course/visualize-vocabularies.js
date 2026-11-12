import { attribute, create } from 'ember-cli-page-object';

import breadcrumbs from '../breadcrumbs';
import vocabulariesChart from './visualize-vocabularies-graph';

const definition = create({
  scope: '[data-test-course-visualize-vocabularies]',
  courseTitle: {
    scope: '[data-test-course-title]',
    link: attribute('href', 'a'),
  },
  breadcrumbs,
  vocabulariesChart,
});

export default definition;
export const component = create(definition);
