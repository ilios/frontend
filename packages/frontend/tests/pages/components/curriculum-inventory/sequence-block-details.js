import { create } from 'ember-cli-page-object';
import header from './sequence-block-header';
import breadcrumbs from 'ilios-common/page-objects/components/breadcrumbs';
import overview from './sequence-block-overview';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-details]',
  header,
  breadcrumbs,
  overview,
};

export default definition;
export const component = create(definition);
