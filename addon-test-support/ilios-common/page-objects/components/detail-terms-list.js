import { clickable, collection, create, isPresent, hasClass, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-detail-terms-list]',
  vocabularyName: text('strong'),
  title: text('[data-test-title]'),
  manage: clickable('[data-test-manage]'),
  terms: collection('.selected-taxonomy-terms li', {
    name: text(),
    remove: clickable(),
    isSelected: hasClass('selected'),
    hasDeleteIcon: isPresent('.fa-xmark'),
  }),
};

export default definition;
export const component = create(definition);
