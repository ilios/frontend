import { clickable, create, collection, isHidden, isPresent, text } from 'ember-cli-page-object';
import bigSaveCancelButtons from 'ilios-common/page-objects/components/big-save-cancel-buttons';

const definition = {
  scope: '[data-test-objective-list-item-descriptors]',
  list: collection('li', {
    title: text(),
    manage: clickable('[data-test-manage]'),
  }),
  isEmpty: isHidden('[data-test-term]'),
  bigSaveCancelButtons,
  canSave: isPresent('[data-test-save]'),
  canCancel: isPresent('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
