import { create, collection, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-profile-learner-groups]',
  title: text('[data-test-title]'),
  groups: collection('[data-test-group]'),
};

export default definition;
export const component = create(definition);
