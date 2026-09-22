import {
  attribute,
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  isVisible,
  notHasClass,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';
import { hasFocus } from 'ilios-common';

const definition = {
  scope: '.mesh-manager',
  selectedTerms: collection('.selected-terms li', {
    title: text('.term-title'),
    remove: clickable('button'),
  }),
  search: {
    scope: '[data-test-mesh-search]',
    label: text('label'),
    set: fillable('input'),
    value: value('input'),
    inputHasFocus: hasFocus('input'),
    placeholder: attribute('placeholder', 'input'),
    esc: triggerable('keyup', 'input', { eventProperties: { key: 'Escape' } }),
  },
  searchResults: collection('[data-test-search-results] [data-test-search-result]', {
    title: text('.descriptor-name'),
    isDisabled: hasClass('disabled'),
    isEnabled: notHasClass('disabled'),
    add: clickable('button'),
  }),
  showMoreIsVisible: isVisible('[data-test-show-more]'),
  showMore: clickable('[data-test-show-more]'),
};

export default definition;
export const component = create(definition);
