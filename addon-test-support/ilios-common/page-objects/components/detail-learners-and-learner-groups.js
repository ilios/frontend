import { clickable, create, isPresent, text } from 'ember-cli-page-object';
import detailLearnergroupsList from './detail-learnergroups-list';
import learnergroupSelectionManager from './learnergroup-selection-manager';
import learnerSelectionManager from './learner-selection-manager';
import selectedLearners from './selected-learners';

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
  detailLearnergroupsList,
  learnergroupsTitle: text('[data-test-learnergroups-title]'),
};

export default definition;
export const component = create(definition);
