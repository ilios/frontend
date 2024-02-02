import { create, collection, fillable, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-new-program-year]',
  title: text('[data-test-title]'),
  years: {
    scope: '[data-test-year]',
    options: collection('option', {
      isSelected: property('selected'),
    }),
    select: fillable(),
  },
  done: {
    scope: '[data-test-done]',
  },
  cancel: {
    scope: '[data-test-cancel]',
  },
};

export default definition;
export const component = create(definition);
