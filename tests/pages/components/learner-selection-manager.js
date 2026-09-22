import { clickable, create, isVisible } from 'ember-cli-page-object';
import selectedLearners from './selected-learners';
import search from './user-search';

const definition = {
  scope: '[data-test-learner-selection-manager]',
  selectedLearners,
  search,
  showMoreIsVisible: isVisible('[data-test-show-more]'),
  showMore: clickable('[data-test-show-more]'),
};

export default definition;
export const component = create(definition);
