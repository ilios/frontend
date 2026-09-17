import { clickable, create, text } from 'ember-cli-page-object';
import details from './user-profile-cohorts-details';
import manager from './user-profile-cohorts-manager';
import bigSaveCancelButtons from 'ilios-common/components/big-save-cancel-buttons';

const definition = {
  scope: '[data-test-user-profile-cohorts]',
  title: text('[data-test-title]', { at: 0 }),
  bigSaveCancelButtons,
  manage: clickable('[data-test-manage]'),
  details,
  manager,
};

export default definition;
export const component = create(definition);
