import { create, clickable, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-instructor-groups-list-item]',
  title: text('[data-test-title]'),
  clickTitle: clickable('[data-test-title] a'),
  users: text('[data-test-users]'),
  courses: text('[data-test-courses]'),
  canBeDeleted: isVisible('[data-test-remove]'),
  remove: clickable('[data-test-remove]'),
};

export default definition;
export const component = create(definition);
