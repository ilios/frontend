import {
  blurrable,
  create,
  clickable,
  fillable,
  text,
  isPresent,
  value,
} from 'ember-cli-page-object';
import publicationMenu from './publication-menu';
import publicationStatus from '../publication-status';
const definition = {
  scope: '[data-test-course-header]',
  title: {
    scope: '[data-test-title]',
    value: text('[data-test-edit]'),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    inputValue: value('input'),
    blur: blurrable('input'),
    hasError: isPresent('[data-test-title-validation-error-message]'),
  },
  academicYear: text('[data-test-academic-year]'),
  publicationMenu,
  publicationStatus,
};

export default definition;
export const component = create(definition);
