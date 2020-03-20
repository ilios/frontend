import {
  create,
  collection,
  isVisible,
} from 'ember-cli-page-object';
import objectiveListItem from './objective-list-item';

const definition = {
  scope: '[data-test-session-objective-list]',
  sortIsVisible: isVisible('[data-test-sort]'),
  headers: collection('table thead th'),
  objectives: collection('table tbody tr', objectiveListItem),
};

export default definition;
export const component = create(definition);
