import { create, hasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-selectable-terms-list-item]',
  title: text('[data-test-title]'),
  isSelected: hasClass('selected'),
};

export default definition;
export const component = create(definition);
