import {
  create,
  collection,
  isVisible,
} from 'ember-cli-page-object';
import objectiveListItem from './objective-list-item';

const definition = {
  scope: '[data-test-session-objective-list]',
  sortIsVisible: isVisible('[data-test-sort]'),
  headers: collection('[data-test-headers] [data-test-header]'),
  objectives: collection('[data-test-session-objective-list-item]', objectiveListItem),
};

export default definition;
export const component = create(definition);
