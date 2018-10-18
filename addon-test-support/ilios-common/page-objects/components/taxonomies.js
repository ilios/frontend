import {
  clickable,
  collection,
  hasClass,
  notHasClass,
  text
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-detail-taxonomies]',
  title: text('.title'),
  manage: clickable('.actions button'),
  save: clickable('.actions .bigadd'),
  cancel: clickable('.actions .bigcancel'),
  vocabularies: collection({
    scope: '.content',
    itemScope: '.detail-terms-list',
    item: {
      name: text('strong', { at: 0 }),
      terms: collection({
        scope: '.selected-taxonomy-terms',
        itemScope: 'li',
        item: {
          name: text(),
        },
      }),
    },
  }),
  manager: {
    selectedTerms: collection({
      scope: '.removable-list',
      itemScope: 'li',
      item: {
        name: text(),
        remove: clickable(),
      },
    }),
    availableTerms: collection({
      scope: '.selectable-terms-list',
      itemScope: 'li',
      item: {
        name: text(),
        notSelected: notHasClass('selected', 'div'),
        isSelected: hasClass('selected', 'div'),
        add: clickable('div'),
      },
    }),
  }
};
