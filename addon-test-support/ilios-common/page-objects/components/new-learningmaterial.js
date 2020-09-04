import { clickable, create, fillable, isVisible } from 'ember-cli-page-object';
import { pageObjectFillInFroalaEditor } from 'ilios-common';
import userNameInfo from './user-name-info';

const definition = {
  scope: '[data-test-new-learningmaterial]',
  name: fillable('input', { at: 0 }),
  author: fillable('input', { at: 1 }),
  url: fillable('input', { at: 2 }),
  citation: fillable('textarea'),
  owningUser: {
    scope: '[data-test-owninguser]',
    userNameInfo
  },
  status: fillable('select', { at: 0 }),
  role: fillable('select', { at: 1 }),
  description: pageObjectFillInFroalaEditor('[data-test-html-editor]'),
  rationale: fillable('[data-test-copyright-rationale]'),
  agreement: clickable('[data-test-copyright-agreement]'),
  save: clickable('.done'),
  cancel: clickable('.cancel'),
  hasAgreementValidationError: isVisible('[data-test-agreement-validation-error-message]'),
};

export default definition;
export const component = create(definition);
