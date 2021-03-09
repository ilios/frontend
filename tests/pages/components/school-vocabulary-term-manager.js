import {
  clickable,
  create,
  collection,
  isPresent,
  fillable,
  property,
  text,
} from 'ember-cli-page-object';
import newTermForm from './school-vocabulary-new-term';

const definition = {
  scope: '[data-test-school-vocabulary-term-manager]',
  title: text('[data-test-title]'),
  editTitle: clickable('[data-test-title] .clickable'),
  changeTitle: fillable('[data-test-title] input'),
  saveTitle: clickable('[data-test-title] .done'),
  hasError: isPresent('[data-test-title] .validation-error-message'),
  errorMessage: text('[data-test-title] .validation-error-message'),
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
    active: property('checked', 'input'),
    toggle: clickable('[data-test-toggle-yesno] .switch-handle'),
  },
  subTerms: {
    scope: '[data-test-sub-terms]',
    list: collection('[data-test-term-list] [data-test-term]', {
      title: text(),
    }),
    newTermForm,
  },
};

export default definition;
export const component = create(definition);
