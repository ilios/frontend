import { clickable, create, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-list-item]',
  title: text('[data-test-title]'),
  academicLevel: text('[data-test-academic-level]'),
  orderInSequence: text('[data-test-order-in-sequence]'),
  startDate: text('[data-test-start-date]'),
  endDate: text('[data-test-end-date]'),
  course: text('[data-test-course]'),
  edit: clickable('[data-test-edit]'),
  remove: clickable('[data-test-remove]'),
  isDeletable: isPresent('[data-test-remove]'),
  confirmRemoval: {
    resetScope: true,
    scope: '[data-test-confirm-removal]',
    confirm: clickable('[data-test-confirm]'),
    cancel: clickable('[data-test-cancel]'),
  },
};

export default definition;
export const component = create(definition);
