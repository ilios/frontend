import { clickable, create, collection, isPresent, fillable, text } from 'ember-cli-page-object';
import newTermForm from './school-vocabulary-new-term';

const definition = {
  scope: '[data-test-school-vocabulary-manager]',
  title: text('[data-test-title]'),
  editTitle: clickable('[data-test-title] [data-test-edit]'),
  changeTitle: fillable('[data-test-title] input'),
  saveTitle: clickable('[data-test-title] .done'),
  hasError: isPresent('[data-test-title] .validation-error-message'),
  errorMessage: text('[data-test-title] .validation-error-message'),
  breadcrumbs: {
    scope: '[data-test-breadcrumbs]',
    all: text('[data-test-all]'),
    vocabulary: text('[data-test-vocabulary]'),
  },
  terms: {
    scope: '[data-test-terms]',
    list: collection('[data-test-term-list] [data-test-term]', {
      title: text(),
      hasChildren: isPresent('[data-test-has-children]'),
    }),
    newTermForm,
  },
};

export default definition;
export const component = create(definition);
