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
  selectedLearnerGroups: collection('.trees fieldset', {
    title: text('legend'),
    removeAll: clickable('[data-test-remove-all]'),
    groups: collection('ul li', {
      title: text(),
      isTopLevelGroup: hasClass('top-level-group'),
      remove: clickable()
    })
  }),
  availableLearnerGroups: {
    scope: '.available-learner-groups',
    title: text('h4'),
    cohorts: collection('[data-test-cohorts] [data-test-cohort]', {
      title: text('h5'),
      topLevelGroups: collection('.tree-groups-list > [data-test-learnergroup-tree]', {
        title: text('> span'),
        enabled: notHasClass('disabled'),
        disabled: hasClass('disabled'),
        add: clickable('.clickable'),
        //this is recursive, but I can't figure out how to do that, so two levels will have to be enough
        groups: collection('ul > [data-test-learnergroup-tree]', {
          title: text('> span'),
          enabled: notHasClass('disabled'),
          disabled: hasClass('disabled'),
          add: clickable('.clickable'),
        })
      }),
    }),
  }
};
