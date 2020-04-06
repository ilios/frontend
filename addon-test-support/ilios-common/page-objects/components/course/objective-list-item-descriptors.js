import {
  clickable,
  create,
  collection,
  isHidden,
  isPresent,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-objective-list-item-descriptors]',
  list: collection('li', {
    title: text(),
    manage: clickable('[data-test-manage]'),
  }),
  empty: isHidden('[data-test-parent]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  canSave: isPresent('[data-test-save]'),
  canCancel: isPresent('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
