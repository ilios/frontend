import { create, clickable, fillable, text, isVisible } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-header]',
  title: {
    scope: '[data-test-title]',
    value: text(),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    hasError: isVisible('.validation-error-message'),
    isEditable: isVisible('[data-test-edit]'),
  },
};

export default definition;
export const component = create(definition);
