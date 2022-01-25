import { create, text } from 'ember-cli-page-object';
import detailLearnergroupsList from './detail-learnergroups-list';

const definition = {
  scope: '[data-test-selected-learner-groups]',
  heading: text('[data-test-heading]'),
  detailLearnergroupsList,
  noGroups: {
    scope: '[data-test-no-selected-learner-groups]',
  },
};

export default definition;
export const component = create(definition);
