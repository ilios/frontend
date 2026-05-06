import { attribute, clickable, create, isPresent, text } from 'ember-cli-page-object';
import { findOne } from 'ember-cli-page-object/extend';
import { getter } from 'ember-cli-page-object/macros';

const definition = {
  scope: '[data-test-curriculum-inventory-report-list-item]',
  name: text('[data-test-name]'),
  nameLink: attribute('href', '[data-test-name] a'),
  program: text('[data-test-program]'),
  year: text('[data-test-year]'),
  startDate: text('[data-test-start-date]'),
  endDate: text('[data-test-end-date]'),
  status: text('[data-test-status]'),
  remove: clickable('[data-test-remove]'),
  isDownloadable: isPresent('[data-test-download]'),
  isDeletable: isVisibleAndEnabled('[data-test-remove]'),
  confirmRemoval: {
    resetScope: true,
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]', { visible: true }),
    cancel: clickable('[data-test-cancel]', { visible: true }),
  },
};

function isVisibleAndEnabled(selector) {
  return getter(function (pageObjectKey) {
    return !findOne(this, selector, { pageObjectKey }).disabled;
  });
}

export default definition;
export const component = create(definition);
