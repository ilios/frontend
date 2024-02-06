import { collection, create, hasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: "[data-test-selectable-terms-list-level='0']",
  items: collection("[data-test-selectable-terms-list-item-level='0']", {
    title: text('[data-test-title]'),
    isSelected: hasClass('selected'),
  }),
  lists: collection("[data-test-selectable-terms-list-level='1']", {
    items: collection("[data-test-selectable-terms-list-item-level='1']", {
      title: text('[data-test-title]'),
      isSelected: hasClass('selected'),
    }),
  }),
};

export default definition;
export const component = create(definition);
