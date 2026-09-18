import { clickable, collection, text } from 'ember-cli-page-object';
import detailTermsList from './detail-terms-list';
import manager from './taxonomy-manager';

export default {
  scope: '[data-test-detail-taxonomies]',
  title: text('.title'),
  manage: clickable('.actions button'),
  save: clickable('.actions [data-test-save]'),
  cancel: clickable('.actions [data-test-cancel]'),
  vocabularies: collection('[data-test-detail-terms-list]', detailTermsList),
  manager,
};
