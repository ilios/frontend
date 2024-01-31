import { create } from 'ember-cli-page-object';

// @todo flesh this out. [ST 2023/09/08]
const definition = {
  scope: '[data-test-user-profile-calendar]',
};

export default definition;
export const component = create(definition);
