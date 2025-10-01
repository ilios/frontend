import { attribute, clickable, create, hasClass, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-fade-text]',
  enabled: isPresent('[data-test-fade-text-control]'),
  displayText: {
    scope: '[data-test-display-text]',
    isFaded: hasClass('faded'),
  },
  control: {
    expand: {
      scope: '[data-test-expand]',
      click: clickable(),
    },
    collapse: {
      scope: '[data-test-collapse]',
      click: clickable(),
    },
    toggleMode: attribute('aria-label'),
  },
};

export default definition;
export const component = create(definition);
