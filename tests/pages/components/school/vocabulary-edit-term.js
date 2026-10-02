import { clickable, create, isPresent, fillable, property, text } from 'ember-cli-page-object';
import yesNoToggle from 'frontend/tests/pages/components/toggle-yesno';

const definition = {
  scope: '[data-test-school-vocabulary-edit-term]',
  title: text('[data-test-vocabulary-edit-term-title]'),
  hasAddSubTerm: isPresent('[data-test-add-sub-term]'),
  addSubTerm: clickable('[data-test-add-sub-term]'),
  hasDeleteTerm: isPresent('[data-test-delete]'),
  deleteTerm: clickable('[data-test-delete]'),
  deleteTermDisabled: property('disabled', '[data-test-delete]'),
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
