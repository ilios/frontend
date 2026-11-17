import { collection, create, text } from 'ember-cli-page-object';

import learnergroupSelectionCohortManager from './learnergroup-selection-cohort-manager';
import search from './search-box';
import selectedLearnerGroups from './selected-learner-groups';

const definition = {
  scope: '[data-test-learnergroup-selection-manager]',
  selectedLearnerGroups,
  availableGroups: {
    scope: '[data-test-available-learner-groups]',
    heading: text('[data-test-heading]'),
    search,
    cohorts: collection(
      '[data-test-learnergroup-selection-cohort-manager]',
      learnergroupSelectionCohortManager,
    ),
  },
};

export default definition;
export const component = create(definition);
