import { clickable, create, text } from 'ember-cli-page-object';
import details from './user-profile-cohorts-details';
import manager from './user-profile-cohorts-manager';
const definition = {
  scope: '[data-test-user-profile-cohorts]',
  title: text('[data-test-title]', { at: 0 }),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  manage: clickable('[data-test-manage]'),
  details,
  manager,
};

export default definition;
export const component = create(definition);
