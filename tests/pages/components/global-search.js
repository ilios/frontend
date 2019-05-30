import { clickable, create, fillable, isVisible } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-global-search]',
  noResultsIsVisible: isVisible('.no-results'),
  input: fillable('input.global-search-input'),
  clickIcon: clickable('[data-test-search-icon]')
};

export default definition;
export const component = create(definition);
