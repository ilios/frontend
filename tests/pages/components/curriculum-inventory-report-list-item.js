import { clickable, create, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-report-list-item]',
  name: text('[data-test-name]'),
  program: text('[data-test-program]'),
  year: text('[data-test-year]'),
  startDate: text('[data-test-start-date]'),
  endDate: text('[data-test-end-date]'),
  status: text('[data-test-status]'),
  clickOnName: clickable('[data-test-name]'),
  clickOnProgram: clickable('[data-test-program]'),
  clickOnYear: clickable('[data-test-year]'),
  clickOnStartDate: clickable('[data-test-start-date]'),
  clickOnEndDate: clickable('[data-test-end-date]'),
  clickOnStatus: clickable('[data-test-status]'),
  remove: clickable('[data-test-remove]'),
  isDeletable: isPresent('[data-test-remove]'),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
  },
};

export default definition;
export const component = create(definition);
