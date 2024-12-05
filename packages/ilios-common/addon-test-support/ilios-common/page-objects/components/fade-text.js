import { attribute, clickable, create, hasClass, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-fade-text]',
  enabled: isPresent('[data-test-fade-text-control]'),
  displayText: {
    scope: '.display-text-wrapper',
    isFaded: hasClass('faded'),
  },
  control: {
    scope: '[data-test-fade-text-control]',
    toggle: clickable('[data-test-expand]'),
    toggleMode: attribute('aria-label', '[data-test-expand]'),
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
