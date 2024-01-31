import { collection, create } from 'ember-cli-page-object';
import header from './sequence-block-header';
import overview from './sequence-block-overview';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-details]',
  header,
  breadcrumbs: {
    scope: '[data-test-breadcrumbs]',
    reportCrumb: {
      scope: '[data-test-report-crumb]',
    },
    blockCrumbs: collection('[data-test-block-crumb]'),
  },
  overview,
};

export default definition;
export const component = create(definition);
