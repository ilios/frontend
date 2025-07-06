import { clickable, create, fillable, isPresent, text } from 'ember-cli-page-object';
import publicationStatus from '../publication-status';
import publicationMenu from './publication-menu';

const definition = {
  scope: '[data-test-session-header]',
  title: {
    scope: '[data-test-title]',
    title: text(),
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
    cancel: clickable('.cancel'),
    value: text(),
    isEditable: isPresent('[data-test-edit]'),
    hasError: isPresent('[data-test-validation-error-message]'),
    error: text('[data-test-validation-error-message]'),
  },
  publicationStatus,
  publicationMenu,
};

export default definition;
export const component = create(definition);
