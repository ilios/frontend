import { clickable, collection, create, is, isHidden } from 'ember-cli-page-object';

const definition = {
  prevIsHidden: isHidden('[data-test-prev]'),
  nextIsHidden: isHidden('[data-test-next]'),
  prevDisabled: is(':disabled', '[data-test-prev]'),
  nextDisabled: is(':disabled', '[data-test-next]'),
  clickPrev: clickable('[data-test-prev]'),
  clickNext: clickable('[data-test-next]'),
  clickLastPage: clickable('[data-test-page-button]:last'),
  pageLinks: collection('[data-test-page-button]', {
    isDisabled: is(':disabled'),
  }),
};

export default definition;
export const component = create(definition);
