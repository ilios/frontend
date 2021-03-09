import {
  clickable,
  create,
  collection,
  fillable,
  text,
  value,
  isVisible,
  triggerable,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-vocabularies-list]',
  expandCollapseButton: {
    scope: '[data-test-expand-collapse-button]',
    toggle: clickable('button'),
  },
  form: {
    scope: '[data-test-new-vocabulary-form]',
    title: {
      scope: '[data-test-title]',
      set: fillable('input'),
      value: value('input'),
      hasError: isVisible('.validation-error-message'),
      submit: triggerable('keyup', 'input', { eventProperties: { key: 'Enter' } }),
      cancel: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
    },
    submit: clickable('[data-test-submit]'),
    cancel: clickable('[data-test-cancel]'),
  },
  savedVocabulary: {
    scope: '[data-test-saved-vocabulary]',
    manage: clickable('[data-test-manage-new-vocabulary]'),
  },
  vocabularies: collection('[data-test-vocabulary]', {
    title: {
      scope: '[data-test-title]',
    },
    termsCount: text('[data-test-terms-count]'),
    manage: clickable('[data-test-manage]'),
    delete: clickable('[data-test-delete]'),
    hasDeleteButton: isVisible('[data-test-delete]'),
  }),
  deletionConfirmation: {
    scope: '[data-test-confirm-removal]',
    submit: clickable('[data-test-submit-removal]'),
    cancel: clickable('[data-test-cancel-removal]'),
  },
};

export default definition;
export const component = create(definition);
