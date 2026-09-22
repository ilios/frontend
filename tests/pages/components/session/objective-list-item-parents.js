import { clickable, create, collection, isHidden, isPresent } from 'ember-cli-page-object';
import fadeText from '../fade-text';

const definition = {
  scope: '[data-test-objective-list-item-parents]',
  fadeText,
  list: collection('li'),
  manage: clickable('[data-test-manage]'),
  empty: isHidden('[data-test-parent]'),
  saveParents: clickable('[data-test-save]'),
  cancelParents: clickable('[data-test-cancel]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  canSave: isPresent('[data-test-save]'),
  canCancel: isPresent('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
