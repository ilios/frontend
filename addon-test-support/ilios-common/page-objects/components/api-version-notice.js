import {
  create,
  hasClass,
  notHasClass,
  property,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-api-version-notice]',
  notMismatched: notHasClass('mismatch'),
  mismatched: hasClass('mismatch'),
  htmlHidden: property('hidden'),
};

export default definition;
export const component = create(definition);
