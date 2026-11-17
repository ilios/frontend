import { clickable, create, text } from 'ember-cli-page-object';

import list from './detail-cohort-list';
import manager from './detail-cohort-manager';

const definition = {
  scope: '[data-test-detail-cohorts]',
  title: text('[data-test-title]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  manage: clickable('[data-test-manage]'),
  manager,
  list,
};

export default definition;
export const component = create(definition);
