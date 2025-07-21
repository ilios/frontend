import { attribute, clickable, create, fillable, isPresent } from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import userNameInfo from './user-name-info';

const definition = {
  scope: '[data-test-new-learningmaterial]',
  displayName: {
    scope: '[data-test-display-name]',
    set: fillable('input'),
    hasError: isPresent('[data-test-display-name-validation-error-message]'),
    ariaInvalid: attribute('aria-invalid', 'input'),
    errorMessage: {
      scope: '[data-test-display-name-validation-error-message]',
    },
  },
  author: {
    scope: '[data-test-author]',
    set: fillable('input'),
    ariaInvalid: attribute('aria-invalid', 'input'),
    errorMessage: {
      scope: '[data-test-author-validation-error-message]',
    },
  },
  url: {
    scope: '[data-test-link]',
    set: fillable('input'),
    ariaInvalid: attribute('aria-invalid', 'input'),
    errorMessage: {
      scope: '[data-test-url-validation-error-message]',
    },
  },
  citation: {
    scope: '[data-test-citation]',
    set: fillable('textarea'),
    ariaInvalid: attribute('aria-invalid', 'input'),
    errorMessage: {
      scope: '[data-test-citation-validation-error-message]',
    },
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
    ariaInvalid: attribute('aria-invalid', 'input'),
    errorMessage: {
      scope: '[data-test-copyright-permission-validation-error-message]',
    },
  },
  copyrightRationale: {
    scope: '[data-test-copyright-rationale]',
    set: fillable('textarea'),
    ariaInvalid: attribute('aria-invalid', 'textarea'),
    errorMessage: {
      scope: '[data-test-copyright-rationale-validation-error-message]',
    },
  },
  fileUpload: {
    scope: '[data-test-file]',
    errorMessage: {
      scope: '[data-test-file-validation-error-message]',
    },
  },
  save: clickable('.done'),
  cancel: clickable('.cancel'),
};

export default definition;
export const component = create(definition);
