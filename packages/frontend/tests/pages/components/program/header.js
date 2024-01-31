import { create, clickable, fillable, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-header]',
  title: {
    scope: '[data-test-title]',
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    canEdit: isVisible('[data-test-edit]'),
    hasError: isVisible('.validation-error-message'),
    errorText: text('.validation-error-message'),
  },
};

export default definition;
export const component = create(definition);
