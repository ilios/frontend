import { create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learner-groups]',
  // TODO: Build this out. [ST 2025/10/31]
};

export default definition;
export const component = create(definition);
