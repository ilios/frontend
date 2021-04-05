import { create, collection, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-pending-updates-summary]',
  title: text('[data-test-title]'),
  courses: collection('[data-test-course]', {
    isLinked: isPresent('a'),
  }),
};

export default definition;
export const component = create(definition);
