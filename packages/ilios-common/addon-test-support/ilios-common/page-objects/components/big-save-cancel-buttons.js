import { attribute, clickable, create, hasClass, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-big-save-cancel-buttons]',
  saveButton: {
    scope: '[data-test-save]',
    cssClasses: attribute('class'),
    ariaLabel: attribute('aria-label'),
    isDisabled: property('disabled'),
    icon: {
      scope: 'svg',
      cssClasses: attribute('class'),
      isSpinning: hasClass('fa-spin'),
    },
  },
  cancelButton: {
    scope: '[data-test-cancel]',
    cssClasses: attribute('class'),
    ariaLabel: attribute('aria-label'),
    isDisabled: property('disabled'),
    icon: {
      scope: 'svg',
      cssClasses: attribute('class'),
    },
  },
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
