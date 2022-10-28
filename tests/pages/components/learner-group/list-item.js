import { create, clickable, hasClass, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learner-group-list-item]',
  title: text('[data-test-title]'),
  clickTitle: clickable('[data-test-title] a'),
  users: text('[data-test-users]'),
  children: text('[data-test-children]'),
  canBeDeleted: isVisible('[data-test-remove]'),
  canBeCopied: isVisible('[data-test-copy]'),
  needsAccommodation: isVisible('[data-test-needs-accommodation]'),
  remove: clickable('[data-test-remove]'),
  copy: clickable('[data-test-copy]'),
  hasRemoveStyle: hasClass('confirm-removal'),
};

export default definition;
export const component = create(definition);
