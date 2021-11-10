import { collection, create, text } from 'ember-cli-page-object';
import detailLearnergroupsList from './detail-learnergroups-list';
import learnergroupTree from './learnergroup-tree';
import search from './search-box';

const definition = {
  scope: '[data-test-learnergroup-selection-manager]',
  selectedGroups: {
    scope: '[data-test-selected-learner-groups]',
    title: text('[data-test-title]', { at: 0 }),
    list: detailLearnergroupsList,
    noGroups: {
      scope: '[data-test-no-selected-learnergroups]',
    },
  },
  availableGroups: {
    scope: '[data-test-available-learner-groups]',
    title: text('[data-test-title]', { at: 0 }),
    search,
    cohorts: collection('[data-test-cohorts]', {
      title: text('[data-test-title]', { at: 0 }),
      trees: collection('[data-test-learnergroup-tree-root=true]', learnergroupTree),
    }),
  },
};

export default definition;
export const component = create(definition);
