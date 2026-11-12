import { clickable, collection, create, isHidden, isPresent } from 'ember-cli-page-object';

import bigSaveCancelButtons from '../big-save-cancel-buttons';
import fadeText from '../fade-text';

const definition = {
  scope: '[data-test-objective-list-item-parents]',
  fadeText,
  list: collection('li'),
  manage: clickable('[data-test-manage]'),
  empty: isHidden('[data-test-parent]'),
  saveParents: clickable('[data-test-save]'),
  cancelParents: clickable('[data-test-cancel]'),
  bigSaveCancelButtons,
  canSave: isPresent('[data-test-save]'),
  canCancel: isPresent('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
