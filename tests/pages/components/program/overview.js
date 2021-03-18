import { create, clickable, fillable, collection } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-overview]',
  shortTitle: {
    scope: '[data-test-short-title]',
    edit: clickable('[data-test-edit]'),
    set: fillable('input'),
    save: clickable('.done'),
  },
  duration: {
    scope: '[data-test-duration]',
    edit: clickable('[data-test-edit]'),
    set: fillable('select'),
    save: clickable('.done'),
    options: collection('select option'),
  },
};

export default definition;
export const component = create(definition);
