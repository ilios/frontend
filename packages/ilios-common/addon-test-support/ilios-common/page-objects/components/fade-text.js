import {
  attribute,
  clickable,
  collection,
  create,
  hasClass,
  isPresent,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-fade-text]',
  enabled: isPresent('[data-test-fade-text-control]'),
  displayText: {
    scope: '[data-test-display-text]',
    isFaded: hasClass('faded'),
  },
  control: {
    scope: '[data-test-fade-text-controls]',
    buttons: collection('button', {
      click: clickable(),
      title: attribute('title'),
    }),
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
