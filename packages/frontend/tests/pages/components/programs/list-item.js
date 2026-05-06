import { create, clickable, text } from 'ember-cli-page-object';
import { findOne } from 'ember-cli-page-object/extend';
import { getter } from 'ember-cli-page-object/macros';

const definition = {
  scope: '[data-test-program-list-item]',
  title: text('[data-test-title]'),
  school: text('[data-test-school]'),
  remove: clickable('[data-test-remove]'),
  open: clickable('[data-test-link]'),
  canBeRemoved: isVisibleAndEnabled('[data-test-remove]'),
  confirmRemoval: {
    scope: '[data-test-confirm-removal] td:nth-of-type(1)',
    message: text('[data-test-message]'),
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
    resetScope: true,
  },
};

function isVisibleAndEnabled(selector) {
  return getter(function (pageObjectKey) {
    return !findOne(this, selector, { pageObjectKey }).disabled;
  });
}

export default definition;
export const component = create(definition);
