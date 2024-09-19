import { create, collection, fillable, property } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-year-filter]',
  choose: fillable(),
  items: collection('option', {
    isSelected: property('selected'),
  }),
};

export default definition;
export const component = create(definition);
