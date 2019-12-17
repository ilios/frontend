import {
  create,
  clickable,
  fillable,
  text,
  isVisible,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-header]',
  title: {
    scope: '[data-test-title]',
    value: text('[data-test-edit]'),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    hasError: isVisible('.validation-error-message')
  },
};

export default definition;
export const component = create(definition);
