import { clickable, create, isPresent, text } from 'ember-cli-page-object';
import detailLearnergroupsList from './detail-learnergroups-list';
import detailLearnerList from './detail-learner-list';
import learnergroupSelectionManager from './learnergroup-selection-manager';
import learnerSelectionManager from './learner-selection-manager';

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
  detailLearnerList,
  detailLearnergroupsList,
  learnersTitle: text('[data-test-learners-title]'),
  learnergroupsTitle: text('[data-test-learnergroups-title]'),
};

export default definition;
export const component = create(definition);
