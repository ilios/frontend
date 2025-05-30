import { clickable, create, fillable, isPresent, text } from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import userNameInfo from './user-name-info';

const definition = {
  scope: '[data-test-new-learningmaterial]',
  displayName: {
    scope: '[data-test-display-name]',
    set: fillable('input'),
    hasError: isPresent('[data-test-display-name-validation-error-message]'),
    error: text('[data-test-display-name-validation-error-message]'),
  },
  author: {
    scope: '[data-test-author]',
    set: fillable('input'),
    hasError: isPresent('[data-test-author-validation-error-message]'),
    error: text('[data-test-author-validation-error-message]'),
  },
  url: {
    scope: '[data-test-link]',
    set: fillable('input'),
    hasError: isPresent('[data-test-url-validation-error-message]'),
    error: text('[data-test-url-validation-error-message]'),
  },
  citation: {
    scope: '[data-test-citation]',
    set: fillable('textarea'),
    hasError: isPresent('[data-test-citation-validation-error-message]'),
    error: text('[data-test-citation-validation-error-message]'),
  },
  owningUser: {
    scope: '[data-test-owninguser]',
    userNameInfo,
  },
  status: {
    scope: '[data-test-status]',
    select: fillable('select'),
  },
  role: {
    scope: '[data-test-role]',
    select: fillable('select'),
  },
  description: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
  copyrightPermission: {
    scope: '[data-test-copyright-permission]',
    toggle: clickable('input'),
    hasError: isPresent('[data-test-copyright-permission-validation-error-message]'),
    error: text('[data-test-copyright-permission-validation-error-message]'),
  },
  copyrightRationale: {
    scope: '[data-test-copyright-rationale]',
    set: fillable('textarea'),
    hasError: isPresent('[data-test-copyright-rationale-validation-error-message]'),
    error: text('[data-test-copyright-rationale-validation-error-message]'),
  },
  fileUpload: {
    scope: '[data-test-file]',
    hasError: isPresent('[data-test-file-validation-error-message]'),
    error: text('[data-test-file-validation-error-message]'),
  },
  save: clickable('.done'),
  cancel: clickable('.cancel'),
};

export default definition;
export const component = create(definition);
