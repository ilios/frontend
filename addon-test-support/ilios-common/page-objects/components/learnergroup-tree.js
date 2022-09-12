import {
  clickable,
  collection,
  create,
  hasClass,
  isVisible,
  property,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learnergroup-tree-root=true]',
  title: text(' > [data-test-checkbox-title]'),
  needsAccommodation: isVisible('> [data-icon="universal-access"]'),
  toggle: clickable(' > [data-test-checkbox]'),
  toggleTitle: clickable(' > [data-test-checkbox-title]'),
  isStyledAsLeaf: hasClass('em'),
  isStyledAsBranch: hasClass('strong'),
  isHidden: property('hidden'),
  isChecked: property('checked', '[data-test-checkbox]', { at: 0 }),
  subgroups: collection('> [data-test-subgroups] > [data-test-learnergroup-tree]', {
    title: text('[data-test-checkbox-title]', { at: 0 }),
    needsAccommodation: isVisible(' > [data-icon="universal-access"]'),
    toggle: clickable('[data-test-checkbox]', { at: 0 }),
    toggleTitle: clickable('[data-test-checkbox-title]', { at: 0 }),
    isStyledAsLeaf: hasClass('em'),
    isStyledAsBranch: hasClass('strong'),
    isHidden: property('hidden'),
    isChecked: property('checked', '[data-test-checkbox]', { at: 0 }),
    subgroups: collection('> [data-test-subgroups] > [data-test-learnergroup-tree]', {
      title: text('[data-test-checkbox-title]', { at: 0 }),
      needsAccommodation: isVisible('[data-icon="universal-access"]'),
      toggle: clickable('[data-test-checkbox]', { at: 0 }),
      toggleTitle: clickable('[data-test-checkbox-title]', { at: 0 }),
      isStyledAsLeaf: hasClass('em'),
      isStyledAsBranch: hasClass('strong'),
      isHidden: property('hidden'),
      isChecked: property('checked', '[data-test-checkbox]', { at: 0 }),
    }),
  }),
};

export default definition;
export const component = create(definition);
