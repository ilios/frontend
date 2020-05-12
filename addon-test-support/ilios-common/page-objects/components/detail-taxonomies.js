import { clickable, collection, text } from 'ember-cli-page-object';
import detailTermsList from './detail-terms-list';
import manager from './taxonomy-manager';

export default {
  scope: '[data-test-detail-taxonomies]',
  title: text('.title'),
  manage: clickable('.actions button'),
  save: clickable('.actions .bigadd'),
  cancel: clickable('.actions .bigcancel'),
  vocabularies: collection('[data-test-detail-terms-list]', detailTermsList),
  manager
};
