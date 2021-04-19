import { collection, create } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-flash-messages]',
  messages: collection('.flash-message'),
};

export default definition;
export const component = create(definition);
