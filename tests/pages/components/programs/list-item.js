import { create, clickable, isVisible, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-list-item]',
  title: text('[data-test-title]'),
  school: text('[data-test-school]'),
  canBeDeleted: isVisible('[data-test-remove]'),
  remove: clickable('[data-test-remove]'),
};

export default definition;
export const component = create(definition);
