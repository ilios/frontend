import { attribute, clickable, create, hasClass, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-fade-text]',
  enabled: isPresent('[data-test-fade-text-control]'),
  displayText: {
    scope: '[data-test-display-text]',
    isFaded: hasClass('faded'),
    id: attribute('id'),
  },
  control: {
    expand: {
      scope: '[data-test-expand]',
      click: clickable(),
      ariaExpanded: attribute('aria-expanded'),
      ariaControls: attribute('aria-controls'),
    },
    collapse: {
      scope: '[data-test-collapse]',
      click: clickable(),
      ariaExpanded: attribute('aria-expanded'),
      ariaControls: attribute('aria-controls'),
    },
    toggleMode: attribute('aria-label'),
  },
};

export default definition;
export const component = create(definition);
