import {
  create,
  hasClass,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-click-choice-buttons]',
  firstButton: {
    scope: '[data-test-first-button]',
    isActive: hasClass('active')
  },
  secondButton: {
    scope: '[data-test-second-button]',
    isActive: hasClass('active')
  },
};

export default definition;
export const component = create(definition);
