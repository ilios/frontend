import { clickable, create, isHidden, isPresent, text } from 'ember-cli-page-object';
import bigSaveCancelButtons from 'frontend/tests/pages/components/big-save-cancel-buttons';

const definition = {
  scope: '[data-test-objective-list-item-competency]',
  competencyTitle: text('[data-test-competency]'),
  domainTitle: text('[data-test-domain]'),
  empty: isHidden('[data-test-competency]'),
  hasCompetency: isPresent('[data-test-competency]'),
  hasDomain: isPresent('[data-test-domain]'),
  manage: clickable('[data-test-manage]'),
  bigSaveCancelButtons,
  canSave: isPresent('[data-test-save]'),
  canCancel: isPresent('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
