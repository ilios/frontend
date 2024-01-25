import { collection, create, fillable, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-pagedlist-controls]',
  firstPage: {
    scope: '[data-test-go-to-first]',
    isDisabled: property('disabled'),
  },
  previousPage: {
    scope: '[data-test-go-to-previous]',
    isDisabled: property('disabled'),
  },
  nextPage: {
    scope: '[data-test-go-to-next]',
    isDisabled: property('disabled'),
  },
  lastPage: {
    scope: '[data-test-go-to-last]',
    isDisabled: property('disabled'),
  },
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
