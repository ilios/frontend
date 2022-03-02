import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  property,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-pagedlist-controls]',
  goBack: clickable('[data-test-go-back]'),
  goForward: clickable('[data-test-go-forward]'),
  canGoBack: isPresent('[data-test-go-back]'),
  canGoForward: isPresent('[data-test-go-forward]'),
  pagerDetails: {
    scope: '[data-test-paged-results-count]',
  },
  limit: {
    scope: '[data-test-limits]',
    set: fillable(),
    options: collection('[data-test-limit]', {
      selected: property('selected'),
    }),
  },
};

export default definition;
export const component = create(definition);
