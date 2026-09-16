import { clickable, collection, text } from 'ember-cli-page-object';
import meshManager from './mesh-manager';

export default {
  scope: '[data-test-detail-mesh]',
  manage: clickable('.actions button'),
  save: clickable('.actions [data-test-save]'),
  cancel: clickable('.actions [data-test-cancel]'),
  current: collection('.selected-mesh-terms li', {
    title: text('.term-title'),
  }),
  meshManager,
};
