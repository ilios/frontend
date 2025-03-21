import {
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  text,
  value,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-instructor-group-header]',
  title: {
    scope: '[data-test-title]',
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    value: value('input'),
    errors: collection('[data-test-title-validation-error-message]'),
    cancel: clickable('.cancel'),
    save: clickable('.done'),
    isEditable: hasClass('editinplace'),
  },
  members: text('[data-test-members]'),
  breadcrumb: {
    scope: '[data-test-breadcrumb]',
    crumbs: collection('span'),
  },
};

export default definition;
export const component = create(definition);
