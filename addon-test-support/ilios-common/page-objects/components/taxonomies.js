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
  vocabularies: collection('.detail-terms-list', {
    name: text('strong', { at: 0 }),
    terms: collection('.selected-taxonomy-terms li', {
      name: text(),
    }),
  }),
  manager: {
    selectedTerms: collection('.removable-list li', {
      name: text(),
      remove: clickable(),
    }),
    availableTerms: collection('.selectable-terms-list li', {
      name: text(),
      notSelected: notHasClass('selected', 'div'),
      isSelected: hasClass('selected', 'div'),
      add: clickable('div'),
    }),
  }
};
