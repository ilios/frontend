import {
  create,
  text,
} from 'ember-cli-page-object';

export default create({
  scope: '[data-test-curriculum-inventory-verification-preview-header]',
  title: text('[data-test-title]'),
});
