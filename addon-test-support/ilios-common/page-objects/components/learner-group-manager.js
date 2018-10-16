import {
  clickable,
  collection,
  fillable,
  hasClass,
  notHasClass,
  text
} from 'ember-cli-page-object';

export default {
  scope: '[data-test-learnergroup-selection-manager]',
  search: fillable('.search-box input'),
  selectedLearnerGroups: collection({
    scope: '.trees',
    itemScope: 'fieldset',
    item: {
      title: text('legend'),
      removeAll: clickable('[data-test-remove-all]'),
      groups: collection({
        scope: 'ul',
        itemScope: 'li',
        item: {
          title: text(),
          isTopLevelGroup: hasClass('top-level-group'),
          remove: clickable()
        }
      })
    },
  }),
  availableLearnerGroups: {
    scope: '.available-learner-groups',
    title: text('h4'),
    cohorts: collection({
      scope: '[data-test-cohorts]',
      itemScope: '[data-test-cohort]',
      item: {
        title: text('h5'),
        topLevelGroups: collection({
          scope: '.tree-groups-list',
          itemScope: '> [data-test-learnergroup-tree]',
          item: {
            title: text('> span'),
            enabled: notHasClass('disabled'),
            disabled: hasClass('disabled'),
            add: clickable('.clickable'),
            //this is recursive, but I can't figure out how to do that, so two levels will have to be enough
            groups: collection({
              scope: 'ul',
              itemScope: '> [data-test-learnergroup-tree]',
              item: {
                title: text('> span'),
                enabled: notHasClass('disabled'),
                disabled: hasClass('disabled'),
                add: clickable('.clickable'),
              }
            })
          }
        }),
      }
    }),
  }
};
