import { collection, create } from 'ember-cli-page-object';
import offeringManager from './offering-manager';

const definition = {
  scope: '[data-test-session-offerings-time-block-offerings]',
  offerings: collection('[data-test-offering-manager]', offeringManager),
};

export default definition;
export const component = create(definition);
