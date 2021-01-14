import {
  clickable,
  create,
  collection,
  isPresent,
} from 'ember-cli-page-object';
import selectedTerms from './detail-terms-list';

const definition = {
  scope: '[data-test-objective-list-item-terms]',
  list: collection('[data-test-detail-terms-list]', selectedTerms),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  canSave: isPresent('[data-test-save]'),
  canCancel: isPresent('[data-test-cancel]'),
  manage: clickable('[data-test-manage]'),
};

export default definition;
export const component = create(definition);
