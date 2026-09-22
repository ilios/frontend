import { clickable, collection, create, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-download-dropdown]',
  toggle: clickable('[data-test-toggle]'),
  menu: {
    scope: '[data-test-menu]',
    displays: isPresent(),
    items: collection('button'),
  },
};

export default definition;
export const component = create(definition);
