import { clickable, create, isPresent, isVisible, fillable, text } from 'ember-cli-page-object';
import newTermForm from './vocabulary-new-term';
import termsList from './vocabulary-terms-list';

const definition = {
  scope: '[data-test-school-vocabulary-manager]',
  backToVocabularies: clickable('[data-test-back-to-vocabularies] a'),
  vocabularyTitle: {
    scope: '[data-test-vocabulary-title]',
    text: text(),
    edit: clickable('[data-test-edit]'),
    change: fillable('input'),
    save: clickable('.done'),
    cancelChanges: clickable('.cancel'),
  },
  hasError: isPresent('[data-test-title-validation-error-message]'),
  error: text('[data-test-title-validation-error-message]'),
  vocabularyTermsTitle: {
    scope: '[data-test-vocabulary-terms-title]',
    text: text(),
  },
  toggleNewVocabularyTermForm: clickable('[data-test-expand-collapse-button] button'),
  toggleNewVocabularyTermFormExists: isVisible('[data-test-expand-collapse-button]'),
  newTermForm,
  terms: {
    scope: '[data-test-terms]',
    termsList,
  },
};

export default definition;
export const component = create(definition);
