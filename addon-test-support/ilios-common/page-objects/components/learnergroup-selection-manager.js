import { collection, create, text } from 'ember-cli-page-object';
import selectedLearnerGroups from './selected-learner-groups';
import learnergroupTree from './learnergroup-tree';
import search from './search-box';

const definition = {
  scope: '[data-test-learnergroup-selection-manager]',
  selectedLearnerGroups,
  availableGroups: {
    scope: '[data-test-available-learner-groups]',
    heading: text('[data-test-heading]'),
    search,
    cohorts: collection('[data-test-cohorts]', {
      title: text('[data-test-title]', { at: 0 }),
      trees: collection('[data-test-learnergroup-tree-root=true]', learnergroupTree),
    }),
  },
};

export default definition;
export const component = create(definition);
