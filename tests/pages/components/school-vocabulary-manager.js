import {
  clickable,
  create,
  collection,
  isPresent,
  fillable,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-vocabulary-manager]',
  title: text('[data-test-title]'),
  editTitle: clickable('[data-test-title] .clickable'),
  changeTitle: fillable('[data-test-title] input'),
  saveTitle: clickable('[data-test-title] .done'),
  breadcrumbs: {
    scope: '[data-test-breadcrumbs]',
    all: text('[data-test-all]'),
    vocabulary: text('[data-test-vocabulary]'),
  },
  terms: {
    scope: '[data-test-terms]',
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
