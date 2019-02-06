import {
  clickable,
  create,
  collection,
  is,
  isPresent,
  fillable,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-vocabulary-term-manager]',
  title: text('[data-test-title]'),
  editTitle: clickable('[data-test-title] .clickable'),
  changeTitle: fillable('[data-test-title] input'),
  saveTitle: clickable('[data-test-title] .done'),
  hasError: isPresent('[data-test-title-error-message]'),
  errorMessage: text('[data-test-title-error-message]'),
  description: text('[data-test-description]'),
  breadcrumbs: {
    scope: '[data-test-breadcrumbs]',
    all: text('[data-test-all]'),
    vocabulary: text('[data-test-vocabulary]'),
    terms: collection('[data-test-term]', {
      title: text(),
    }),
  },
  isActive: {
    scope: '[data-test-is-active]',
    active: is(':checked', 'input'),
    toggle: clickable('[data-test-toggle-yesno]'),
  },
  subTerms: {
    scope: '[data-test-sub-terms]',
    list: collection('[data-test-term-list] [data-test-term]', {
      title: text(),
    }),
    newTermForm: {
      scope: '[data-test-new-term-form]',
      setTitle: fillable('input'),
      save: clickable('.save'),
      hasError: isPresent('[data-test-error-message]'),
      errorMessage: text('[data-test-error-message]'),
    }
  },

};

export default definition;
export const component = create(definition);
