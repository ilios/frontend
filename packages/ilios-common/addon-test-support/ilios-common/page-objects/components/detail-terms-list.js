import { clickable, collection, create, text } from 'ember-cli-page-object';
import listItem from './detail-terms-list-item';

const definition = {
  scope: '[data-test-detail-terms-list]',
  vocabularyName: text('strong'),
  title: text('[data-test-title]'),
  manage: clickable('[data-test-manage]'),
  terms: collection('[data-test-detail-terms-list-item]', listItem),
};

export default definition;
export const component = create(definition);
