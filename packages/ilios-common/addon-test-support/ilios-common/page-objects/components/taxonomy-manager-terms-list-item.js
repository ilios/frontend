import { isPresent, create, hasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-taxonomy-manager-terms-list-item]',
  isButton: hasClass('taxonomy-manager-terms-list-item-button'),
  title: text('[data-test-title]'),
  isInactive: isPresent('[data-test-inactive]'),
  isSelected: hasClass('selected'),
  hasAddIcon: isPresent('[data-test-add]'),
  hasRemoveIcon: isPresent('[data-test-remove]'),
};

export default definition;
export const component = create(definition);
