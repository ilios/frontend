import { clickable, collection, create, text } from 'ember-cli-page-object';
import listItem from './sequence-block-list-item';
import newSequenceBlock from './new-sequence-block';

const definition = {
  scope: '[data-test-curriculum-inventory-sequence-block-list]',
  header: {
    scope: '[data-test-header]',
    title: text('[data-test-title]'),
    expandCollapse: {
      scope: '[data-test-expand-collapse-button]',
      toggle: clickable('button'),
    },
  },
  list: {
    scope: '[data-test-list]',
    headers: {
      scope: 'thead',
      sequenceBlock: text('th:eq(0)'),
      level: text('th:eq(1)'),
      sequenceNumber: text('th:eq(2)'),
      startDate: text('th:eq(3)'),
      endDate: text('th:eq(4)'),
      course: text('th:eq(5)'),
      actions: text('th:eq(6)'),
    },
    items: collection('[data-test-curriculum-inventory-sequence-block-list-item]', listItem),
  },
  newBlock: {
    scope: '[data-test-new]',
    form: newSequenceBlock,
  },
  noSubSequenceBlocks: {
    scope: '[data-test-no-sub-sequence-blocks]',
  },
  noSequenceBlocks: {
    scope: '[data-test-no-sequence-blocks]',
  },
};

export default definition;
export const component = create(definition);
