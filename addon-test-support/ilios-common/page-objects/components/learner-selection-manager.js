import { clickable, create, isVisible, text } from 'ember-cli-page-object';
import detailLearnerList from './detail-learner-list';
import search from './user-search';

const definition = {
  scope: '[data-test-learner-selection-manager]',
  selectedLearners: {
    scope: '[data-test-selected-learners-section]',
    heading: text('h4'),
    detailLearnerList,
    noLearners: {
      scope: '[data-test-no-selected-learners]',
    },
  },
  search,
  showMoreIsVisible: isVisible('[data-test-show-more]'),
  showMore: clickable('[data-test-show-more]'),
};

export default definition;
export const component = create(definition);
