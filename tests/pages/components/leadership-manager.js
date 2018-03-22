import {
  clickable,
  collection,
  fillable,
  hasClass,
  notHasClass
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-leadership-manager]',
  selectedDirectors: collection({
    scope: 'tbody tr:nth-of-type(1) td:nth-of-type(1) ul',
    itemScope: 'li',
    item: {
      remove: clickable('i'),
    }
  }),
  directorSearch: {
    scope: 'tbody tr:nth-of-type(2) td:nth-of-type(1) [data-test-leadership-search]',
    search: fillable('input[type=search]'),
    results: collection({
      scope: '.results',
      itemScope: '[data-test-result]',
      item: {
        add: clickable(),
        isSelectable: hasClass('clickable'),
        isSelected: notHasClass('clickable'),
      },
    }),
  },
  administratorSearch: {
    scope: 'tbody tr:nth-of-type(2) td:nth-of-type(2) [data-test-leadership-search]',
    search: fillable('input[type=search]'),
    results: collection({
      scope: '.results',
      itemScope: '[data-test-result]',
      item: {
        add: clickable(),
        isSelectable: hasClass('clickable'),
        isSelected: notHasClass('clickable'),
      },
    }),
  },
  selectedAdministrators: collection({
    scope: 'tbody tr:nth-of-type(1) td:nth-of-type(2) ul',
    itemScope: 'li',
    item: {
      remove: clickable('i'),
    }
  }),
};
