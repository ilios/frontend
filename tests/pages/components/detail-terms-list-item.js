import { clickable, create, isPresent, hasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-detail-terms-list-item]',
  name: text(),
  remove: clickable('button'),
  isSelected: hasClass('selected'),
  hasDeleteIcon: isPresent('.fa-xmark'),
};

export default definition;
export const component = create(definition);
