import { clickable, create, text } from 'ember-cli-page-object';

import newVocabularyForm from './new-vocabulary-form';
import vocabulariesList from './vocabularies-list';
import vocabularyManager from './vocabulary-manager';

const definition = {
  scope: '[data-test-school-vocabularies-expanded]',
  title: text('[data-test-vocabularies-title]'),
  collapse: clickable('[data-test-vocabularies-title]'),
  openNewVocabularyForm: clickable('[data-test-new-vocabulary] button'),
  vocabularyManager,
  vocabulariesList,
  newVocabularyForm,
};

export default definition;
export const component = create(definition);
