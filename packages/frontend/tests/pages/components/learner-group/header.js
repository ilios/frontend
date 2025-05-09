import {
  collection,
  clickable,
  create,
  fillable,
  hasClass,
  text,
  value,
  isPresent,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learner-group-header]',
  title: {
    scope: '[data-test-title]',
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    value: value('input'),
    hasError: isPresent('[data-test-title-validation-error-message]'),
    error: text('[data-test-title-validation-error-message]'),
    cancel: clickable('.cancel'),
    save: clickable('.done'),
    isEditable: hasClass('editinplace'),
  },
  members: text('[data-test-members]'),
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span', {
      visit: clickable('a'),
    }),
  },
};

export default definition;
export const component = create(definition);
