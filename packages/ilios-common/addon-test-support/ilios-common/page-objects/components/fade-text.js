import { attribute, clickable, create, hasClass, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-fade-text]',
  enabled: isPresent('[data-test-fade-text-control]'),
  displayText: {
    scope: '.display-text-wrapper',
    isFaded: hasClass('faded'),
  },
  control: {
    expand: clickable('[data-test-expand]'),
    collapse: clickable('[data-test-collapse]'),
    toggleMode: attribute('aria-label'),
  },
  expand: {
    scope: '[data-test-expand]',
  },
  collapse: {
    scope: '[data-test-collapse]',
  },
};

export default definition;
export const component = create(definition);
