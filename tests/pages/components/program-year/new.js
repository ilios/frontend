import { create, clickable, collection, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-new-program-year]',
  title: text('[data-test-title]'),
  years: {
    scope: '[data-test-year]',
    options: collection('option'),
  },
  done: {
    scope: '[data-test-done]',
    click: clickable(),
  },
  cancel: {
    scope: '[data-test-cancel]',
    click: clickable(),
  },
};

export default definition;
export const component = create(definition);
