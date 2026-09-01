import { clickable, create, text, value } from 'ember-cli-page-object';
import { flatpickrDatePicker } from 'ilios-common';

const definition = {
  scope: '[data-test-token-maintenance]',
  name: text('[data-test-name]'),
  newTokenForm: {
    scope: '[data-test-new-token-form]',
    dateValue: value('input'),
    setDate: flatpickrDatePicker('input'),
    submit: clickable('[data-test-new-token-create]'),
    cancel: clickable('[data-test-new-token-cancel]'),
  },
  newTokenResult: {
    scope: '[data-test-new-token-result]',
    value: value('input'),
    reset: clickable('[data-test-result-reset]'),
  },
  invalidateTokensForm: {
    scope: '[data-test-invalidate-tokens-form]',
    submit: clickable('[data-test-invalidate-tokens-submit]'),
    cancel: clickable('[data-test-invalidate-tokens-cancel]'),
  },
  showCreateNewTokenForm: clickable('[data-test-show-create-new-token]'),
  showInvalidateTokensForm: clickable('[data-test-show-invalidate-tokens]'),
  tokenInfoLink: text('[data-test-token-info-link]'),
};

export default definition;
export const component = create(definition);
