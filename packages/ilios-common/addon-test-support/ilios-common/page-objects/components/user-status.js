import { create, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-status]',
  accountIsDisabled: isPresent(),
  title: text('title'),
};

export default definition;
export const component = create(definition);
