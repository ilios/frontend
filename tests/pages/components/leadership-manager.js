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
    scope: '[data-test-directors] ul',
    itemScope: 'li',
    item: {
      remove: clickable('i'),
    }
  }),
  directorSearch: {
    scope: '[data-test-director-search] [data-test-leadership-search]',
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
    scope: '[data-test-administrator-search] [data-test-leadership-search]',
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
    scope: '[data-test-administrators] ul',
    itemScope: 'li',
    item: {
      remove: clickable('i'),
    }
  }),
};
