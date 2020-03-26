import {clickable, collection, create, fillable, hasClass, isVisible, notHasClass, text} from 'ember-cli-page-object';
import detailLearnerList from './detail-learner-list';


const definition = {
  scope: '[data-test-learner-selection-manager]',
  selectedLearners: {
    scope: '[data-test-selected-learners-section]',
    heading: text('h4'),
    detailLearnerList,
    noLearners: {
      scope: '[data-test-no-selected-learners]'
    }
  },
  search: fillable('[data-test-search-box] input'),
  runSearch: clickable('[data-test-search-box] .search-icon'),
  searchResults: collection('[data-test-user-search] [data-test-result]', {
    fullName: text('.name'),
    email: text('.email'),
    isDisabled: hasClass('disabled'),
    isEnabled: notHasClass('disabled'),
    add: clickable(),
  }),
  showMoreIsVisible: isVisible('[data-test-show-more]'),
  showMore: clickable('[data-test-show-more]'),
};

export default definition;
export const component = create(definition);
