import { clickable, collection, create, property, isHidden } from 'ember-cli-page-object';

const definition = {
  prevIsHidden: isHidden('[data-test-prev]'),
  nextIsHidden: isHidden('[data-test-next]'),
  prevDisabled: property('disabled', '[data-test-prev]'),
  nextDisabled: property('disabled', '[data-test-next]'),
  clickPrev: clickable('[data-test-prev]'),
  clickNext: clickable('[data-test-next]'),
  clickLastPage: clickable('[data-test-page-button]:last'),
  pageLinks: collection('[data-test-page-button]', {
    isDisabled: property('disabled'),
  }),
};

export default definition;
export const component = create(definition);
