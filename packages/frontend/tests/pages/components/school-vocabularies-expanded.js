import { clickable, create, text } from 'ember-cli-page-object';
import termManager from './school-vocabulary-term-manager';
import vocabularyManager from './school-vocabulary-manager';
import vocabulariesList from './school-vocabularies-list';
import newVocabularyForm from './school-new-vocabulary-form';

const definition = {
  scope: '[data-test-school-vocabularies-expanded]',
  title: text('[data-test-vocabularies-title]'),
  collapse: clickable('[data-test-vocabularies-title]'),
  openNewVocabularyForm: clickable('[data-test-new-vocabulary] button'),
  termManager,
  vocabularyManager,
  vocabulariesList,
  newVocabularyForm,
};

export default definition;
export const component = create(definition);
