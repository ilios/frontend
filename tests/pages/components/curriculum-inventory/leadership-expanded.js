import { create } from 'ember-cli-page-object';
import leadershipList from 'ilios-common/page-objects/components/leadership-list';
import leadershipManager from 'ilios-common/page-objects/components/leadership-manager';

const definition = {
  scope: '[data-test-curriculum-inventory-leadership-expanded]',
  collapse: {
    scope: '[data-test-collapse]',
  },
  manage: {
    scope: '[data-test-manage]',
  },
  save: {
    scope: '[data-test-save]',
  },
  cancel: {
    scope: '[data-test-cancel]',
  },
  leadershipList,
  leadershipManager,
};

export default definition;
export const component = create(definition);
