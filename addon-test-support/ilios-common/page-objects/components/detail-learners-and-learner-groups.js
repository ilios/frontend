import { clickable, create, isPresent, text } from 'ember-cli-page-object';
import learnergroupSelectionManager from './learnergroup-selection-manager';
import learnerSelectionManager from './learner-selection-manager';
import selectedLearners from './selected-learners';
import selectedLearnerGroups from './selected-learner-groups';

const definition = {
  scope: '[data-test-detail-learners-and-learner-groups]',
  title: text('[data-test-title]', { at: 0 }),
  manage: clickable('[data-test-manage]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  hasManageButton: isPresent('[data-test-manage]'),
  hasSaveButton: isPresent('[data-test-save]'),
  hasCancelButton: isPresent('[data-test-cancel]'),
  learnerSelectionManager,
  learnergroupSelectionManager,
  selectedLearners,
  selectedLearnerGroups,
};

export default definition;
export const component = create(definition);
