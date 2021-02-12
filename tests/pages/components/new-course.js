import {clickable, collection, create, fillable, property, text} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-new-course]',
  title: fillable('[data-test-title]'),
  chooseYear: fillable('[data-test-year]'),
  save: clickable('.done'),
  years: collection({
    itemScope: '[data-test-year] option',
    item: {
      text: text(),
      selected: property('selected'),
    },
  }),
};

export default definition;
export const component = create(definition);
