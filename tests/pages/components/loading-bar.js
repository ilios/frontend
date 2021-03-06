import { attribute, create } from 'ember-cli-page-object';

export default create({
  scope: '[data-test-loading-bar]',
  bar: {
    scope: '[data-test-bar]',
    value: attribute('data-value'),
  },
});
