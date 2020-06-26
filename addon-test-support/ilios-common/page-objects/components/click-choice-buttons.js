import {
  create,
  hasClass,
  is,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-click-choice-buttons]',
  firstButton: {
    scope: '[data-test-first-button]',
    hasActiveStyle: hasClass('active'),
    isActive: is('[data-test-active]'),
  },
  secondButton: {
    scope: '[data-test-second-button]',
    hasActiveStyle: hasClass('active'),
    isActive: is('[data-test-active]'),
  },
};

export default definition;
export const component = create(definition);
