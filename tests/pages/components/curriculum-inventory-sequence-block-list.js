import {
  collection,
  clickable
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-curriculum-inventory-sequence-block-list]',
  list: collection('.list tbody tr' , {
    remove: clickable('.remove'),
    confirmRemoval: clickable('.remove', { scope: '.confirm-buttons'}),
  }),
};
