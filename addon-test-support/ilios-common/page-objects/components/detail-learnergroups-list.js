import {
  clickable,
  collection,
  create,
  hasClass,
  isHidden,
  isVisible,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-detail-learnergroups-list]',
  isEmpty: isHidden('[data-test-trees]'),
  trees: collection('[data-test-tree]', {
    title: text('legend'),
    removeAllSubgroups: clickable('[data-test-remove-all]'),
    subgroups: collection('[data-test-subgroup]', {
      title: text('[data-test-title]'),
      needsAccommodation: isVisible('[data-icon="universal-access"]', { at: 0 }),
      isTopLevel: hasClass('top-level-group'),
      isRemovable: hasClass('.clickable'),
      remove: clickable('[data-test-remove-learnergroup]'),
    }),
  }),
};

export default definition;
export const component = create(definition);
