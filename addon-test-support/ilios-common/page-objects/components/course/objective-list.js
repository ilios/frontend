import {
  create,
  collection,
  isVisible,
} from 'ember-cli-page-object';
import objectiveListItem from './objective-list-item';

const definition = {
  scope: '[data-test-course-objective-list]',
  sortIsVisible: isVisible('[data-test-sort]'),
  headers: collection('[data-test-headers] [data-test-header]'),
  objectives: collection('[data-test-course-objective-list-item]', objectiveListItem),
};

export default definition;
export const component = create(definition);
