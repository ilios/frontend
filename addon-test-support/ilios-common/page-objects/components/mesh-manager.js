import {
  clickable,
  collection,
  create,
  hasClass,
  isVisible,
  notHasClass,
  text,
} from 'ember-cli-page-object';
import search from './search-box';

const definition = {
  scope: '.mesh-manager',
  selectedTerms: collection('.selected-terms li', {
    title: text('.term-title'),
    remove: clickable(),
  }),
  search,
  searchResults: collection('[data-test-search-results] [data-test-search-result]', {
    title: text('.descriptor-name'),
    isDisabled: hasClass('disabled'),
    isEnabled: notHasClass('disabled'),
    add: clickable(),
  }),
  showMoreIsVisible: isVisible('[data-test-show-more]'),
  showMore: clickable('[data-test-show-more]'),
};

export default definition;
export const component = create(definition);
