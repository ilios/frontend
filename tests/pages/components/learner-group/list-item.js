import { create, clickable, hasClass, isPresent, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learner-group-list-item]',
  title: text('[data-test-title] a'),
  needsAccommodation: isVisible('[data-test-needs-accommodation]'),
  clickTitle: clickable('[data-test-title] a'),
  users: text('[data-test-users]'),
  children: text('[data-test-children]'),
  canBeDeleted: isVisible('[data-test-remove]'),
  canBeCopied: isVisible('[data-test-copy]'),
  subgroupNeedsAccommodation: isPresent('[data-test-subgroup-needs-accommodation]'),
  subgroupNeedsAccommodationTitle: text('[data-test-subgroup-needs-accommodation] title'),
  remove: clickable('[data-test-remove]'),
  copy: clickable('[data-test-copy]'),
  hasRemoveStyle: hasClass('confirm-removal'),
};

export default definition;
export const component = create(definition);
