import { create, collection, isVisible, text } from 'ember-cli-page-object';
import objectiveListItem from './objective-list-item';

const definition = {
  scope: '[data-test-program-year-objective-list]',
  sortIsVisible: isVisible('[data-test-sort]'),
  headers: collection('[data-test-headers] [data-test-header]'),
  objectives: collection('[data-test-program-year-objective-list-item]', objectiveListItem),
  expanded: collection('[data-test-program-year-objective-list-item-expanded]', {
    courseTitle: text('[data-test-title]'),
    objectives: collection('[data-test-course-objective]'),
  }),
};

export default definition;
export const component = create(definition);
