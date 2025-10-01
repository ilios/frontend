import {
  clickable,
  create,
  collection,
  isPresent,
  fillable,
  text,
  property,
} from 'ember-cli-page-object';
import newTermForm from './school-vocabulary-new-term';
import yesNoToggle from 'ilios-common/page-objects/components/toggle-yesno';
import { pageObjectFillInQuillEditor } from 'ilios-common';

const definition = {
  scope: '[data-test-school-vocabulary-term-manager]',
  title: text('[data-test-title]'),
  editTitle: clickable('[data-test-title] [data-test-edit]'),
  changeTitle: fillable('[data-test-title] input'),
  saveTitle: clickable('[data-test-title] .done'),
  cancelTitleChanges: clickable('[data-test-title] .cancel'),
  hasError: isPresent('[data-test-title-validation-error-message]'),
  error: text('[data-test-title-validation-error-message]'),
  description: {
    scope: '[data-test-description]',
    edit: clickable('[data-test-edit]'),
    set: pageObjectFillInQuillEditor('[data-test-html-editor]'),
    savingIsDisabled: property('disabled', '.done'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    hasError: isPresent('[data-test-description-validation-error-message]'),
    error: text('[data-test-description-validation-error-message]'),
  },
  delete: clickable('[data-test-delete]'),
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
    yesNoToggle,
  },
  subTerms: {
    scope: '[data-test-sub-terms]',
    list: collection('[data-test-term-list] [data-test-term]', {
      title: text(),
      hasChildren: isPresent('[data-test-has-children]'),
    }),
    newTermForm,
  },
};

export default definition;
export const component = create(definition);
