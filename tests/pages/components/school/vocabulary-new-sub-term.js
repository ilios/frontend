import { clickable, create, isPresent, fillable, text } from 'ember-cli-page-object';
import yesNoToggle from 'frontend/tests/pages/components/toggle-yesno';

const definition = {
  resetScope: true,
  scope: '[data-test-school-vocabulary-terms-list-item] + [data-test-school-vocabulary-new-term]',
  title: text('[data-test-vocabulary-new-term-title]'),
  hasEditTerm: isPresent('[data-test-edit-term]'),
  editTerm: clickable('[data-test-edit-term]'),
  setTitle: fillable('[data-test-vocabulary-term-title] input'),
  isActive: {
    scope: '[data-test-vocabulary-term-is-active]',
    yesNoToggle,
  },
  setDescription: fillable('[data-test-vocabulary-term-description] textarea'),
  save: clickable('[data-test-submit]'),
  cancel: clickable('[data-test-cancel]'),
  hasError: isPresent('[data-test-title-validation-error-message]'),
  errorMessage: text('[data-test-title-validation-error-message]'),
};

export default definition;
export const component = create(definition);
