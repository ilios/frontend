import { clickable, create, collection, hasClass, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-report-list]',
  headers: {
    scope: 'table thead',
    name: text('th', { at: 0 }),
    program: text('th', { at: 1 }),
    year: text('th', { at: 2 }),
    startDate: text('th', { at: 3 }),
    endDate: text('th', { at: 4 }),
    status: text('th', { at: 5 }),
    actions: text('th', { at: 6 }),
    clickOnName: clickable('th', { at: 0 }),
    clickOnYear: clickable('th', { at: 2 }),
  },
  reports: collection('table tbody [data-test-report]', {
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
    remove: clickable('[data-icon="trash"]', { scope: '[data-test-actions]' }),
    isDeletable: hasClass('enabled', '[data-test-actions] [data-icon="trash"]'),
  }),
  confirmRemoval: {
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
    isVisible: isVisible(),
  },
  emptyList: {
    scope: '[data-test-empty-list]',
    text: text(),
  },
};

export default definition;
export const component = create(definition);
